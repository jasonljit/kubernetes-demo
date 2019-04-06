# kubernetes-demo

## Pod

- k8s 最小運行單位
- pod 裡運行 container

**建立 pod**
```
kubectl apply -f https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/example-yaml/pod.yaml
```

[pod.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/example-yaml/pod.yaml)

**看是否成功建立**
```
kubectl get pods --show-labels
```

**看詳細內容**
```
kubectl describe pods demo-pod
```

> 也可以用 web ui 來看 kubernetes 的狀態：`minikube dashboard`

## Doployment

- 幫助部署應用服務的工具
    - replica
    - 升級 (roll out)
    - 退回先前版本 (roll back)
    
## Service

- 負責網路設定
- 兩個種類：ClusterIP & NodePort

### ClusterIP

**建立 ClusterIP  service**
```
kubectl apply -f https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/example-yaml/cluster-ip-service.yaml
```
[cluster-ip-service.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/example-yaml/cluster-ip-service.yaml)

**建立測試用的 alpine pod**
```
kubectl apply -f https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/example-yaml/alpine-pod.yaml
```

**進入 alpine container 的 sh**
```
kubectl exec -it alpine -- sh
```

**可以用 service name 戳剛才建立的 web**
```
curl demo-cluster-ip-service
```

### NodePort

**建立 NodePort  service**
```
kubectl apply -f https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/example-yaml/node-port-service.yaml
```
[cluster-ip-service.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/example-yaml/node-port-service.yaml)

**取得 url**
```
minikube service demo-node-port-service --url
```

## Label

- 一對具有辨識度的key/value (env: production, company: ljit)
- 用來當作篩選條件


### 用 label 來決定 pod 要跑在哪個 node 上
**建立有 nodeSelector 的 pod**
```
kubectl apply -f https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/label/pod-with-node-selector.yaml
```
[pod-with-node-selector.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/label/pod-with-node-selector.yaml)  

由於找不到帶有 hardware=high-memory label 的 node，pod 卡在 pending 狀態

**把 node 加上 hardware=high-memory label**
```
kubectl label node minikube hardware=high-memory
```

## Health Check

可能 pod 正常運行，但內部 container 的 service crash 了，可以透過 health check 檢查出來並重啟 container

**建立有 health check 的 pod**
```
kubectl apply -f https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/health-check/pod-with-health-check.yaml
```
[pod-with-health-check.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/health-check/pod-with-health-check.yaml)  
[docker-demo:1.0.1](https://github.com/jasonljit/kubernetes-demo/blob/master/health-check/docker-demo-1.0.1/index.js)

**建立該 pod 的 service**
```
kubectl expose pod pod-with-health-check --type=NodePort --name=service-with-health-check
```

**取得 url**
```
minikube service service-with-health-check --url
```

**戳 /sick 使 /health 失效**
> health check 達到失敗上限，重啟 container

**查看 pod 的詳細資訊可以看到重啟的 log**
```
kubectl describe pod/pod-with-health-check
```

## Volume

儲存空間
- emptyDir
- hostPath
- cloud storage

### emptyDir

**建立含有兩個 container 的 pod**

這兩個 container 都把 emptyDir volume 掛載在 /cache
```
kubectl apply -f https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/volume/pod-with-empty-dir.yaml
```
[pod-with-empty-dir.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/volume/pod-with-empty-dir.yaml)

**進入 container-1 的 bash，並在 /cache 資料夾新增檔案**
```
kubectl exec -it pod-with-empty-dir -c container-1 -- bash
echo Hello > /cache/hello.txt 
```

**進入 container-2 的 bash，檢查 /cache 資料夾是否有剛才新增的檔案**
```
kubectl exec -it pod-with-empty-dir -c container-2 -- bash
cat /cache/hello.txt 
```

### hostPath
**建立含有一個 container 的 pod，並把 host 的 /tmp 掛載到 container 的 /tmp**
```
kubectl apply -f https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/volume/pod-with-host-path.yaml
```
[pod-with-host-path.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/volume/pod-with-host-path.yaml)

**用 ssh 連到 host，查看 /tmp 底下的資料，新增一個檔案**
```
minikube ssh
ls -l /tmp
echo Hello > /tmp/hello.txt 
```

**進入 container 的 bash，確認 volume 有被掛載**
```
kubectl exec -it pod-with-host-path -- bash
ls -l /tmp
cat /tmp/hello.txt
```

### cloud storage
Ex: aws-ebs
- 建立一個 volume
- 把 volume 掛載到 pod 上
```
apiVersion: v1
kind: Pod
metadata:
  name: apiserver
spec:
  containers:
  - name: apiserver
    image: jasonljit/docker-demo:1.0.0
    ports:
      - containerPort: 3000
    volumeMounts:
      - name: aws-ebs-volumes
        mountPath: /tmp
        
  volumes:
  - name: aws-ebs-volumes
    awsElasticBlockStore:
     volumeID: vol-0b29e0a08749ccef3
```

## Config Map
用來存 configure

**下載 config 檔**
```
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/config-map/config.json -o ./my-config.json
```
[config.json](https://github.com/jasonljit/kubernetes-demo/blob/master/config-map/config.json)

**用檔案產生 config map**
```
kubectl create configmap my-config --from-file=./my-config.json
```

**建立 pod**

用 volume 的方式把 config 掛載到 pod 裡
```
kubectl apply -f https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/config-map/pod-with-config-map.yaml
```
[pod-with-config-map.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/config-map/pod-with-config-map.yaml)  
[docker-demo:1.0.3](https://github.com/jasonljit/kubernetes-demo/blob/master/config-map/docker-demo-1.0.3/index.js)

**進到 container 的 bash，用 curl 戳 server，確認 config map 有被掛載**
```
kubectl exec -it pod-with-config-map -- bash
curl localhost:3000/config
```

<hr />

**刪掉 kubernetes resources**
```
kubectl delete [RESOURCE_NAME, ...]
```
