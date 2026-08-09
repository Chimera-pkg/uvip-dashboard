import { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const { Sider, Header, Content, Footer } = Layout;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <Sider
        width={250}
        collapsedWidth={80}
        collapsed={collapsed}
        className="!bg-[#0f1a2e] overflow-hidden"
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

      <Layout
        style={{ marginLeft: collapsed ? 80 : 250, transition: "margin-left 0.2s" }}
      >
        <Header
          className="bg-white border-b border-gray-200 shadow-sm px-0"
          style={{ height: 56, lineHeight: "56px", padding: 0 }}
        >
          <AppHeader collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </Header>

        <Content className="p-5 bg-[#f0f2f5]">{children}</Content>

        <Footer className="bg-white border-t border-gray-200 p-0">
          <AppFooter />
        </Footer>
      </Layout>
    </Layout>
  );
}
