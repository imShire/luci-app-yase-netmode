# luci-app-yase-netmode

有线宽带（wan）与 5G 蜂窝（usbwan）双链路的出口模式切换插件，fork 自
[FAN789/luci-app-h5000m-netmode](https://github.com/FAN789/luci-app-h5000m-netmode)
（Apache-2.0），针对 JDCloud RE-SS-01（ImmortalWrt, qualcommax/ipq60xx）适配。

## 功能

- 四种出口策略：有线 WAN 优先（`wan_first`）、5G 优先（`modem_first`）、
  仅有线（`wan_only`）、仅 5G（`modem_only`）。这四种是
  「首选哪条线 × 是否允许断线自动切换」的 2×2 组合，界面按这两轴排列
- LuCI 界面（网络 → 网络模式）：上方两张卡片只展示各线路的实时状态与当前
  角色，不响应点击；下方 2×2 单选格选择出口模式，点「应用设置」才生效。
  5 秒轮询，已选未应用的选择不会被轮询覆盖
- 接口 hotplug 自动重算，链路恢复后无需人工干预
- IPv6 自动跟随 IPv4 出口（避免 IPv4 走 WAN、IPv6 走 5G 的分流）
- 默认出口变化时自动重载代理服务（内置 daed，额外服务用
  `list proxy_services` 配置）
- UCI 持久化 `/etc/config/yase_netmode`，sysupgrade 保留
- 不依赖 mwan3、不依赖云服务、不收集任何数据

## 与原插件的区别

| 项目 | h5000m-netmode | yase-netmode |
|---|---|---|
| 5G 接口 | 扫描 MT5700M/USB section | 固定 `usbwan`，IPv6 探测 `usbwan6`/`@usbwan` |
| 代理联动 | 仅硬编码 daed | daed + 可配置 `proxy_services` 列表 |
| ACL | 可写 network/mt5700m | 只写 yase_netmode |
| 菜单 | 网络 → Mobile Network | 网络 → 网络模式 |

## 安装

本项目针对使用 `apk` 的 ImmortalWrt 构建真实 APK。推荐通过 GitHub Actions 的
`Build Release` workflow 构建，不要使用旧的本地 `build-ipk.sh`。

```sh
# 上传 GitHub 后，打 tag（tag 必须和 Makefile 的 PKG_VERSION 一致）
git tag v1.1.0
git push origin v1.1.0
```

Actions 完成后会生成两个包：

```text
luci-app-yase-netmode-1.1.0-r1.apk
luci-i18n-yase-netmode-zh-cn-*.apk
```

在路由器上安装（包由你自己的 GitHub Actions 构建）：

```sh
apk add --allow-untrusted /tmp/luci-app-yase-netmode-1.1.0-r1.apk
apk add --allow-untrusted /tmp/luci-i18n-yase-netmode-*.apk
```

如果以后把包发布到自己的 APK 仓库，应使用仓库签名公钥安装，而不是长期使用
`--allow-untrusted`。安装完成后强制刷新 LuCI（Ctrl+F5）。

## 本地静态检查

与 `.github/workflows/ci.yml` 一致。`gettext` 和 `jq` 需要先安装。

```sh
sh -n root/etc/hotplug.d/iface/95-yase-netmode
sh -n root/etc/uci-defaults/90-yase-netmode
sh -n root/usr/sbin/yase-netmode
sh -n root/usr/sbin/yase-netmode-status
node --check htdocs/luci-static/resources/view/yase_netmode/netmode.js
jq empty root/usr/share/luci/menu.d/luci-app-yase-netmode.json
jq empty root/usr/share/rpcd/acl.d/luci-app-yase-netmode.json
msgfmt --check --check-format -o /dev/null po/zh_Hans/yase-netmode.po
grep -Fx 'PKG_NAME:=luci-app-yase-netmode' Makefile
grep -Fx 'LUCI_PKGARCH:=all' Makefile
grep -Fx '/etc/config/yase_netmode' Makefile
```

注意 `sh -n` 只检查语法，不检查未定义变量（CI 里没有 shellcheck），后端脚本
的变量改动仍需人工复核。

## 注意

- 切换基于 netifd metric / defaultroute，只感知接口层 up/down；
  “接口在线但公网不通”不会触发切换。
- 切换时已有 TCP 连接会因源地址变化而断开（属自动恢复，非完全无缝）。
- 出口模式在 `network reload` 成功之后才落盘。reload 失败时后端会把
  `network` 配置回滚到上一个模式并再次 reload，此时模式不会被改成新的，
  界面会提示重试。
- 构建脚本使用 ImmortalWrt `qualcommax/ipq60xx` snapshot SDK，并通过 SDK 生成 APK。
- 目标固件版本如不是当前 snapshot，建议把 `IMMORTALWRT_SDK_BASE_URL` 指向完全匹配的 SDK 目录。
