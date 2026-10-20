import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Layout, Drawer } from "antd";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const { Sider, Header, Content, Footer } = Layout;

export default function MainLayout() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Automatically close mobile drawer when user navigates
  useEffect(() => {
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <Layout className="min-h-screen">
      {/* Mobile Drawer Sidebar */}
      {isMobile ? (
        <Drawer
          placement="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          styles={{
            body: {
              padding: 0,
              background: "linear-gradient(180deg, #0f1a2e 0%, #162240 100%)",
              overflow: "hidden",
            },
            header: { display: "none" },
          }}
          width={260}
          closable={false}
        >
          <Sidebar
            collapsed={false}
            onItemClick={() => setMobileDrawerOpen(false)}
          />
        </Drawer>
      ) : (
        /* Desktop Fixed Sider */
        <Sider
          width={250}
          collapsedWidth={80}
          collapsed={collapsed}
          className="bg-[#0f1a2e]! overflow-hidden"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            background: "linear-gradient(180deg, #0f1a2e 0%, #162240 100%)",
          }}
        >
          <Sidebar collapsed={collapsed} />
        </Sider>
      )}

      {/* Main Content Layout */}
      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
          transition: "margin-left 0.2s ease-in-out",
          minWidth: 0,
        }}
        className="min-h-screen flex flex-col"
      >
        <Header
          className="bg-white border-b border-gray-200 shadow-sm px-0 sticky top-0 z-20"
          style={{ height: 56, lineHeight: "56px", padding: 0 }}
        >
          <AppHeader
            collapsed={collapsed}
            isMobile={isMobile}
            onToggle={() => {
              if (isMobile) {
                setMobileDrawerOpen((prev) => !prev);
              } else {
                setCollapsed((prev) => !prev);
              }
            }}
          />
        </Header>

        <Content className="p-3 sm:p-5 bg-[#f0f2f5] min-w-0 flex-1">
          <Outlet />
        </Content>

        <Footer className="bg-white border-t border-gray-200 p-0">
          <AppFooter />
        </Footer>
      </Layout>
    </Layout>
  );
}
