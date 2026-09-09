include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-yase-netmode
PKG_VERSION:=1.0.0
PKG_RELEASE:=1
PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE

LUCI_TITLE:=YASE network mode switcher (wired WAN / 5G)
LUCI_DEPENDS:=+luci-base
LUCI_PKGARCH:=all

define Package/luci-app-yase-netmode/conffiles
/etc/config/yase_netmode
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
