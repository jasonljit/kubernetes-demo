# kubernetes-demo

## Label

- 一對具有辨識度的key/value (env: production, env: dev)
- 用來當作篩選條件


### Case 1: 建立帶有 label & annotation 的 pod
```
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/label/pod-with-label-and-annotation.yaml | kubectl apply -f -
```
[pod-with-label-and-annotation.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/label/pod-with-label-and-annotation.yaml)  
[docker-demo:1.0.0](https://github.com/jasonljit/kubernetes-demo/blob/master/label/docker-demo-1.0.0/index.js)
> annotation: 類似 label，給人看的資訊，kubernetes 不會拿來用

**看是否成功建立**
```
kubectl get pods --show-labels
```

**看詳細內容**
```
kubectl describe pods pod-with-label-and-annotation
```

### Case 2: 用 label 來決定 pod 要跑在哪個 node 上
**建立有 nodeSelector 的 pod**
```
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/label/pod-with-node-selector.yaml | kubectl apply -f -
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
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/health-check/pod-with-health-check.yaml | kubectl apply -f -
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


## Kube-dns
Kubernetes 內部提供一個 kube-dns 的插件，讓我們可以不需要知道 Service 的 Cluster IP ，只透過 Service 的名稱，就能找到相對應 Pods 。

### 用 alpine 測試用 service name 連到服務

**建立 alpine pod，並進入 shell**
```
kubectl run -i --tty alpine --image=alpine --restart=Never -- sh
```

**安裝 curl 套件**
```
apk add --no-cache curl
```

**用 service name 戳剛才建立的 web**
```
curl service-with-health-check:3000
```
有收到 response，代表 kube-dns 有把 service name 轉成 clusterIP

## Volume

儲存空間
- emptyDir
- hostPath
- cloud storage

### emptyDir

**建立含有兩個 container 的 pod**

這兩個 container 都把 emptyDir volume 掛載在 /cache
```
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/volume/pod-with-empty-dir.yaml | kubectl apply -f -
```
[pod-with-empty-dir.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/volume/pod-with-empty-dir.yaml)

**進入 container-1 的 bash，並在 /cache 資料夾新增檔案**
```
kubectl exec -it empty-dir-pod -c container-1 -- /bin/bash
echo Hello > /cache/hello.txt 
```

**進入 container-2 的 bash，檢查 /cache 資料夾是否有剛才新增的檔案**
```
kubectl exec -it empty-dir-pod -c container-2 -- /bin/bash
cat /cache/hello.txt 
```

### hostPath
**建立含有一個 container 的 pod，並把 host 的 /tmp 掛載到 container 的 /tmp**
```
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/volume/pod-with-host-path.yaml | kubectl apply -f -
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
kubectl exec -it host-path-pod -- /bin/bash
ls -l /tmp
cat /tmp/hello.txt
```


## Config Map
用來存 configure

**下載 config 檔**
```
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/config-map/config.json -o ~/my-config.json
```
[config.json](https://github.com/jasonljit/kubernetes-demo/blob/master/config-map/config.json)

**用檔案產生 config map**
```
kubectl create configmap my-config --from-file=~/my-config.json
```

**建立 pod**

用 volume 的方式把 config 掛載到 pod 裡
```
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/config-map/pod-with-config-map.yaml | kubectl apply -f -
```
[pod-with-config-map.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/config-map/pod-with-config-map.yaml)  
[docker-demo:1.0.3](https://github.com/jasonljit/kubernetes-demo/blob/master/config-map/docker-demo-1.0.3/index.js)

**expose service**
```
kubectl expose pod pod-with-config-map --type=NodePort --name=service-with-config-map
```

**get url**
```
minikube service service-with-config-map --url
```
