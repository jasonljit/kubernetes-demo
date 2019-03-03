# kubernetes-demo

## Label

- 一對具有辨識度的key/value (env: production, env: dev)
- 用來當作篩選條件
> annotation: 類似 label，給人看的資訊，k8s 不會拿來用


### Case 1: 建立帶有 label & annotation 的 pod
```
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/pod-with-label-and-annotation.yaml | kubectl apply -f -
```
[pod-with-label-and-annotation.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/pod-with-label-and-annotation.yaml)

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
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/pod-with-node-selector.yaml | kubectl apply -f -
```
[pod-with-node-selector.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/pod-with-node-selector.yaml)

由於找不到帶有 hardware=high-memory label 的 node，pod 卡在 pending 狀態

**把 node 加上 hardware=high-memory label**
```
kubectl label node minikube hardware=high-memory
```

## Health Check

可能 pod 正常運行，但內部 container 的 service crash 了，可以透過 health check 檢查出來並重啟 container

**建立有 health check 的 deployment**
```
curl https://raw.githubusercontent.com/jasonljit/kubernetes-demo/master/deployment-with-health-check.yaml | kubectl apply -f -
```
[deployment-with-health-check.yaml](https://github.com/jasonljit/kubernetes-demo/blob/master/deployment-with-health-check.yaml)

**建立該 deployment 的 service**
```
kubectl expose deploy deployment-with-health-check --type=NodePort --name=deployment-with-health-check-service
```

**取得 url**
```
minikube service deployment-with-health-check-service --url
```

**戳 /shut-down 使 webapp 停止運作**
> health check 達到失敗上限，重啟 container
