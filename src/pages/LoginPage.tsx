import { Form, Input, Button, Checkbox } from "antd";
import {
  MailOutlined,
  LockOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import uvipLogo from "../assets/uvip-logo.svg";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    const success = await login(values.email, values.password);
    if (success) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0f1a2e 0%, #162240 25%, #1a2d52 50%, #0f1a2e 75%, #0a1120 100%)",
        }}
      />

      {/* Floating orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, #3b82f6, transparent 70%)",
          top: "-10%",
          right: "-10%",
          animation: "pulse 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
        style={{
          background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
          bottom: "-5%",
          left: "-5%",
          animation: "pulse 10s ease-in-out infinite reverse",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={uvipLogo} alt="UVIP" className="h-12" />
          </div>
          <p className="text-blue-200/60 text-sm">
            Urban Visual Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="login-card rounded-2xl p-8 shadow-2xl shadow-black/30">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-800">Selamat Datang</h1>
            <p className="text-gray-400 text-sm mt-1">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              label={
                <span className="text-gray-600 text-sm font-medium">
                  Email
                </span>
              }
              name="email"
              rules={[
                { required: true, message: "Masukkan email Anda" },
                { type: "email", message: "Format email tidak valid" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-300" />}
                placeholder="admin@uvip.id"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-gray-600 text-sm font-medium">
                  Password
                </span>
              }
              name="password"
              rules={[{ required: true, message: "Masukkan password Anda" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-300" />}
                placeholder="••••••••"
                size="large"
                className="rounded-lg"
                iconRender={(visible) =>
                  visible ? (
                    <EyeOutlined />
                  ) : (
                    <EyeOutlined className="text-gray-300" />
                  )
                }
              />
            </Form.Item>

            <div className="flex items-center justify-between mb-5">
              <Checkbox className="text-gray-500 text-sm">
                Ingat saya
              </Checkbox>
              <a className="text-blue-500 text-sm hover:text-blue-600 cursor-pointer">
                Lupa password?
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                className="rounded-lg h-11 font-semibold text-sm shadow-lg shadow-blue-500/30"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  border: "none",
                }}
              >
                Masuk
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center text-xs text-gray-300 mt-4">
            Demo: <span className="text-gray-500">admin@uvip.id</span> /{" "}
            <span className="text-gray-500">admin123</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-blue-200/30 mt-6">
          © 2026 Wolftagon. All rights reserved.
        </p>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}
