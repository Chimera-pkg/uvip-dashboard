import { useEffect, useState, useRef } from "react";
import {
  Button,
  Card,
  Spin,
  Tag,
  Tooltip,
  message,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tabs,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  FileImageOutlined,
  ReloadOutlined,
  LogoutOutlined,
  CameraOutlined,
  EditOutlined,
  LockOutlined,
  KeyOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { authService, type User } from "../api/auth.service";
import {
  usersService,
  type UpdateProfileRequest,
  type UpdatePasswordRequest,
} from "../api/users.service";

export default function UserProfilePage() {
  const { user: authUser, logout, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [avatarError, setAvatarError] = useState<boolean>(false);

  // Active tab state
  const [activeTabKey, setActiveTabKey] = useState<string>("overview");

  // Modals state
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] =
    useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState<boolean>(false);

  // Loading states for actions
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [updatingProfile, setUpdatingProfile] = useState<boolean>(false);
  const [updatingPassword, setUpdatingPassword] = useState<boolean>(false);

  // Forms
  const [profileFormModal] = Form.useForm();
  const [profileFormTab] = Form.useForm();
  const [passwordFormModal] = Form.useForm();
  const [passwordFormTab] = Form.useForm();

  // Hidden file input for avatar upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await authService.getCurrentUser();
      setUser(data);
      setAvatarError(false);
      await refreshUser();
      return data;
    } catch (error) {
      console.error("Failed to load user profile:", error);
      if (authUser) {
        setUser(authUser);
      }
      if (!silent) {
        message.error("Gagal memperbarui data profil dari server.");
      }
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Sync form values when user changes
  useEffect(() => {
    if (user) {
      const formValues = {
        name: user.name || "",
        email: user.email || "",
        role: user.role || "admin",
        is_active: user.is_active ?? true,
      };
      profileFormModal.setFieldsValue(formValues);
      profileFormTab.setFieldsValue(formValues);
    }
  }, [user, profileFormModal, profileFormTab]);

  // 1. PATCH /users/me/avatar
  const handleAvatarFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (max 5MB)
    const isValidType = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ].includes(file.type);
    if (!isValidType) {
      message.error(
        "Hanya format file PNG, JPG, JPEG, atau WEBP yang diperbolehkan!",
      );
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("Ukuran file foto profil maksimal 5 MB!");
      e.target.value = "";
      return;
    }

    setUploadingAvatar(true);
    try {
      await usersService.updateAvatar(file);
      // Get profile ulang setelah update avatar
      await fetchProfile(true);
      message.success("Foto profil berhasil diperbarui!");
    } catch (err: any) {
      console.error("Failed to update avatar:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Gagal mengunggah foto profil.";
      message.error(
        typeof errorMsg === "string"
          ? errorMsg
          : "Gagal mengunggah foto profil.",
      );
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 2. PATCH /users/me
  const handleUpdateProfile = async (values: UpdateProfileRequest) => {
    setUpdatingProfile(true);
    try {
      const payload: UpdateProfileRequest = {
        name: values.name.trim(),
        email: values.email.trim(),
        role: values.role,
        is_active: Boolean(values.is_active),
      };

      await usersService.updateMe(payload);
      // Get profile ulang setelah update profile
      const updatedUser = await fetchProfile(true);

      if (updatedUser) {
        const formValues = {
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          role: updatedUser.role || "admin",
          is_active: updatedUser.is_active ?? true,
        };
        profileFormModal.setFieldsValue(formValues);
        profileFormTab.setFieldsValue(formValues);
      }

      message.success("Profil berhasil diperbarui!");
      setIsEditProfileModalOpen(false);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Gagal memperbarui profil pengguna.";
      message.error(
        typeof errorMsg === "string" ? errorMsg : "Gagal memperbarui profil.",
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  // 3. PATCH /users/me/password
  const handleUpdatePassword = async (values: any, isModal = false) => {
    if (values.new_password !== values.confirm_password) {
      message.error("Konfirmasi kata sandi baru tidak cocok!");
      return;
    }

    if (values.old_password === values.new_password) {
      message.warning(
        "Kata sandi baru tidak boleh sama dengan kata sandi lama!",
      );
      return;
    }

    setUpdatingPassword(true);
    try {
      const payload: UpdatePasswordRequest = {
        old_password: values.old_password,
        new_password: values.new_password,
      };

      await usersService.updatePassword(payload);
      // Get profile ulang setelah update password
      await fetchProfile(true);
      message.success(
        "Kata sandi berhasil diperbarui! Silakan gunakan kata sandi baru untuk login berikutnya.",
      );

      if (isModal) {
        passwordFormModal.resetFields();
        setIsChangePasswordModalOpen(false);
      } else {
        passwordFormTab.resetFields();
      }
    } catch (err: any) {
      console.error("Failed to update password:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Gagal memperbarui kata sandi. Pastikan kata sandi lama benar.";
      message.error(
        typeof errorMsg === "string"
          ? errorMsg
          : "Gagal memperbarui kata sandi.",
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  function resolveMediaUrl(
    pathOrUrl?: string | null,
    fallbackBase = API_BASE_URL,
  ): string {
    if (!pathOrUrl) return "";
    const trimmed = pathOrUrl.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }
    const cleanBase = fallbackBase.replace(/\/$/, "");
    const cleanPath = trimmed.replace(/^\//, "");
    return `${cleanBase}/${cleanPath}`;
  }

  const avatarUrl = user?.profile_file_path
    ? resolveMediaUrl(user.profile_file_path)
    : undefined;

  const roleOptions = [
    { value: "admin", label: "Admin (Administrator)" },
    { value: "user", label: "User (Pengguna)" },
    { value: "operator", label: "Operator" },
    { value: "researcher", label: "Researcher (Peneliti)" },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans max-w-5xl mx-auto">
      {/* Hidden file input for Avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileSelected}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: "none" }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
            Profil Pengguna
          </h1>
          <p className="text-slate-500 text-sm m-0">
            Kelola informasi akun, foto profil, dan kata sandi Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setIsEditProfileModalOpen(true)}
            className="rounded-lg font-medium shadow-xs text-xs sm:text-sm px-2.5 sm:px-3.5 h-8 sm:h-9"
          >
            Edit Profil
          </Button>

          <Button
            icon={<LockOutlined />}
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="rounded-lg text-slate-700 font-medium text-xs sm:text-sm px-2.5 sm:px-3.5 h-8 sm:h-9"
          >
            Ubah Sandi
          </Button>

          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => fetchProfile()}
            disabled={loading}
            className="rounded-lg text-slate-700 font-medium text-xs sm:text-sm px-2.5 sm:px-3.5 h-8 sm:h-9"
          >
            Segarkan
          </Button>

          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={() => logout()}
            className="rounded-lg font-medium text-xs sm:text-sm px-2.5 sm:px-3.5 h-8 sm:h-9"
          >
            Keluar
          </Button>
        </div>
      </div>

      {loading && !user ? (
        <Card className="rounded-2xl border border-gray-100 shadow-xs py-16 text-center">
          <Spin size="large" />
          <div className="mt-3 text-sm text-slate-500">
            Memuat profil pengguna...
          </div>
        </Card>
      ) : user ? (
        <>
          {/* Main Hero Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            {/* Header Banner */}
            <div className="h-36 sm:h-44 bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 relative">
              <div className="absolute inset-0 bg-white/5 opacity-50 backdrop-blur-xs"></div>
            </div>

            {/* Profile Bar */}
            <div className="px-4 sm:px-8 pb-6 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-18 mb-4">
                {/* Avatar with Camera upload overlay */}
                <div className="relative group">
                  <div
                    onClick={() =>
                      !uploadingAvatar && fileInputRef.current?.click()
                    }
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white cursor-pointer relative"
                    title="Klik untuk ubah foto profil"
                  >
                    {uploadingAvatar ? (
                      <div className="flex flex-col items-center justify-center gap-1.5 bg-black/50 absolute inset-0 z-10 text-white">
                        <Spin size="small" />
                        <span className="text-[10px] font-medium">
                          Mengunggah...
                        </span>
                      </div>
                    ) : avatarUrl && !avatarError ? (
                      <img
                        src={avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="text-4xl font-extrabold uppercase">
                        {user.name?.charAt(0) || "U"}
                      </span>
                    )}

                    {/* Hover Camera Overlay */}
                    {!uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                        <CameraOutlined className="text-xl" />
                        <span className="text-[11px] font-medium">
                          Ubah Foto
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Camera Quick Action Badge Button */}
                  <Tooltip title="Unggah Foto Profil Baru (PATCH /users/me/avatar)">
                    <button
                      type="button"
                      onClick={() =>
                        !uploadingAvatar && fileInputRef.current?.click()
                      }
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <CameraOutlined className="text-xs" />
                    </button>
                  </Tooltip>
                </div>

                {/* Right Badges & Quick Action Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 mt-2 sm:mt-0">
                  <Tag
                    color={user.role === "admin" ? "blue" : "purple"}
                    className="px-3 py-1 text-xs font-bold uppercase rounded-lg border-none"
                  >
                    <SafetyCertificateOutlined className="mr-1" />
                    {user.role}
                  </Tag>

                  <Tag
                    color={user.is_active ? "success" : "error"}
                    className="px-3 py-1 text-xs font-semibold rounded-lg border-none flex items-center gap-1"
                  >
                    {user.is_active ? (
                      <>
                        <CheckCircleOutlined />
                        <span>Akun Aktif</span>
                      </>
                    ) : (
                      <>
                        <CloseCircleOutlined />
                        <span>Non-aktif</span>
                      </>
                    )}
                  </Tag>

                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setActiveTabKey("edit-profile");
                      window.scrollTo({ top: 380, behavior: "smooth" });
                    }}
                    className="rounded-lg text-xs"
                  >
                    Edit
                  </Button>
                </div>
              </div>

              {/* User Primary Info */}
              <div className="text-center sm:text-left mt-2">
                <h2 className="text-2xl font-bold text-slate-800 capitalize m-0">
                  {user.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-slate-500 mt-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <MailOutlined className="text-blue-500" />
                    <span>{user.email}</span>
                  </span>
                  {user.profile_filename && (
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <FileImageOutlined className="text-indigo-400" />
                      <span>{user.profile_filename}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Profile Sections */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6">
            <Tabs
              activeKey={activeTabKey}
              onChange={setActiveTabKey}
              items={[
                {
                  key: "overview",
                  label: (
                    <span className="flex items-center gap-2 font-medium">
                      <IdcardOutlined />
                      <span>Ringkasan Akun</span>
                    </span>
                  ),
                  children: (
                    <div className="space-y-6 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card 1: Informasi Pribadi */}
                        <div className="bg-slate-50/70 rounded-2xl p-5 border border-gray-100 space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
                            <div className="flex items-center gap-2">
                              <UserOutlined className="text-blue-500 text-base" />
                              <h3 className="text-base font-bold text-slate-800 m-0">
                                Informasi Pribadi
                              </h3>
                            </div>
                            <Button
                              type="link"
                              size="small"
                              onClick={() => setIsEditProfileModalOpen(true)}
                              className="p-0 text-xs font-semibold"
                            >
                              Edit
                            </Button>
                          </div>

                          <div className="space-y-3.5 text-xs sm:text-sm">
                            <div>
                              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                                Nama Lengkap
                              </div>
                              <div className="font-semibold text-slate-800 capitalize">
                                {user.name}
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                                Alamat Email
                              </div>
                              <div className="font-semibold text-slate-800 font-mono">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card 2: Status & Riwayat Akun */}
                        <div className="bg-slate-50/70 rounded-2xl p-5 border border-gray-100 space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
                            <div className="flex items-center gap-2">
                              <IdcardOutlined className="text-indigo-500 text-base" />
                              <h3 className="text-base font-bold text-slate-800 m-0">
                                Status & Riwayat Akun
                              </h3>
                            </div>
                            <Button
                              type="link"
                              size="small"
                              onClick={() => setIsChangePasswordModalOpen(true)}
                              className="p-0 text-xs font-semibold"
                            >
                              Ubah Sandi
                            </Button>
                          </div>

                          <div className="space-y-3.5 text-xs sm:text-sm">
                            <div>
                              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                                Peran Sistem (Role)
                              </div>
                              <div className="font-semibold text-slate-800 uppercase">
                                {user.role}
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                                Terakhir Masuk (Last Login)
                              </div>
                              <div className="flex items-center gap-2 font-medium text-slate-700">
                                <ClockCircleOutlined className="text-slate-400" />
                                <span>
                                  {user.last_login_at
                                    ? dayjs(user.last_login_at).format(
                                        "D MMMM YYYY, HH:mm [WIB]",
                                      )
                                    : "Belum pernah login"}
                                </span>
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                                Tanggal Terdaftar (Created At)
                              </div>
                              <div className="flex items-center gap-2 font-medium text-slate-700">
                                <CalendarOutlined className="text-slate-400" />
                                <span>
                                  {user.created_at
                                    ? dayjs(user.created_at).format(
                                        "D MMMM YYYY, HH:mm [WIB]",
                                      )
                                    : "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "edit-profile",
                  label: (
                    <span className="flex items-center gap-2 font-medium">
                      <EditOutlined />
                      <span>Edit Profil</span>
                    </span>
                  ),
                  children: (
                    <div className="pt-2 max-w-2xl">
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-slate-800 m-0">
                          Perbarui Informasi Profil
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Perbarui nama lengkap, email, peran pengguna, dan
                          status aktif akun Anda (PATCH /users/me).
                        </p>
                      </div>

                      <Form
                        form={profileFormTab}
                        layout="vertical"
                        onFinish={handleUpdateProfile}
                      >
                        <Form.Item
                          label={
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">
                              Nama Lengkap
                            </span>
                          }
                          name="name"
                          rules={[
                            {
                              required: true,
                              message: "Nama lengkap tidak boleh kosong!",
                            },
                          ]}
                        >
                          <Input
                            prefix={<UserOutlined className="text-slate-400" />}
                            placeholder="Masukkan nama lengkap"
                            className="rounded-xl py-2"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">
                              Alamat Email
                            </span>
                          }
                          name="email"
                          rules={[
                            {
                              required: true,
                              message: "Email tidak boleh kosong!",
                            },
                            {
                              type: "email",
                              message: "Format email tidak valid!",
                            },
                          ]}
                        >
                          <Input
                            prefix={<MailOutlined className="text-slate-400" />}
                            placeholder="nama@domain.com"
                            className="rounded-xl py-2"
                          />
                        </Form.Item>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Form.Item
                            label={
                              <span className="font-semibold text-slate-700 text-xs sm:text-sm">
                                Peran Sistem (Role)
                              </span>
                            }
                            name="role"
                            rules={[
                              {
                                required: true,
                                message: "Pilih peran pengguna!",
                              },
                            ]}
                          >
                            <Select
                              options={roleOptions}
                              className="rounded-xl h-10"
                              placeholder="Pilih role"
                            />
                          </Form.Item>

                          <Form.Item
                            label={
                              <span className="font-semibold text-slate-700 text-xs sm:text-sm">
                                Status Akun (is_active)
                              </span>
                            }
                            name="is_active"
                            valuePropName="checked"
                          >
                            <div className="flex items-center gap-3 pt-1.5">
                              <Switch defaultChecked={user.is_active} />
                              <span className="text-xs text-slate-500">
                                Akun dapat mengakses sistem
                              </span>
                            </div>
                          </Form.Item>
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                          <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={updatingProfile}
                            className="rounded-xl font-medium px-5 h-10 shadow-xs"
                          >
                            Simpan Perubahan
                          </Button>
                          <Button
                            onClick={() => {
                              profileFormTab.setFieldsValue({
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                is_active: user.is_active,
                              });
                            }}
                            className="rounded-xl font-medium h-10"
                          >
                            Reset
                          </Button>
                        </div>
                      </Form>
                    </div>
                  ),
                },
                {
                  key: "security",
                  label: (
                    <span className="flex items-center gap-2 font-medium">
                      <LockOutlined />
                      <span>Ubah Password</span>
                    </span>
                  ),
                  children: (
                    <div className="pt-2 max-w-2xl">
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-slate-800 m-0">
                          Perbarui Kata Sandi Akun
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Pastikan menggunakan kata sandi yang kuat dengan
                          kombinasi huruf, angka, dan simbol (PATCH
                          /users/me/password).
                        </p>
                      </div>

                      <Form
                        form={passwordFormTab}
                        layout="vertical"
                        onFinish={(values) =>
                          handleUpdatePassword(values, false)
                        }
                      >
                        <Form.Item
                          label={
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">
                              Kata Sandi Lama (old_password)
                            </span>
                          }
                          name="old_password"
                          rules={[
                            {
                              required: true,
                              message: "Masukkan kata sandi lama Anda!",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined className="text-slate-400" />}
                            placeholder="Masukkan kata sandi saat ini"
                            className="rounded-xl py-2"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">
                              Kata Sandi Baru (new_password)
                            </span>
                          }
                          name="new_password"
                          rules={[
                            {
                              required: true,
                              message: "Masukkan kata sandi baru!",
                            },
                            {
                              min: 6,
                              message: "Kata sandi minimal 6 karakter!",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={<KeyOutlined className="text-slate-400" />}
                            placeholder="Masukkan kata sandi baru (minimal 6 karakter)"
                            className="rounded-xl py-2"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span className="font-semibold text-slate-700 text-xs sm:text-sm">
                              Konfirmasi Kata Sandi Baru
                            </span>
                          }
                          name="confirm_password"
                          dependencies={["new_password"]}
                          rules={[
                            {
                              required: true,
                              message: "Konfirmasi kata sandi baru!",
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (
                                  !value ||
                                  getFieldValue("new_password") === value
                                ) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  new Error(
                                    "Konfirmasi kata sandi tidak cocok!",
                                  ),
                                );
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            prefix={<KeyOutlined className="text-slate-400" />}
                            placeholder="Ulangi kata sandi baru"
                            className="rounded-xl py-2"
                          />
                        </Form.Item>

                        <div className="pt-2 flex items-center gap-3">
                          <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={updatingPassword}
                            className="rounded-xl font-medium px-5 h-10 shadow-xs"
                          >
                            Perbarui Kata Sandi
                          </Button>
                          <Button
                            onClick={() => passwordFormTab.resetFields()}
                            className="rounded-xl font-medium h-10"
                          >
                            Bersihkan
                          </Button>
                        </div>
                      </Form>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Modal 1: Edit Profile (PATCH /users/me) */}
          <Modal
            title={
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-1">
                <EditOutlined className="text-blue-500" />
                <span>Edit Profil Pengguna</span>
              </div>
            }
            open={isEditProfileModalOpen}
            onCancel={() =>
              !updatingProfile && setIsEditProfileModalOpen(false)
            }
            footer={null}
            destroyOnClose={false}
            centered
            className="rounded-2xl"
          >
            <Form
              form={profileFormModal}
              layout="vertical"
              onFinish={handleUpdateProfile}
              className="pt-2"
            >
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Nama Lengkap
                  </span>
                }
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Nama lengkap tidak boleh kosong!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400" />}
                  placeholder="Nama lengkap"
                  className="rounded-xl py-2"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Alamat Email
                  </span>
                }
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Email tidak boleh kosong!",
                  },
                  {
                    type: "email",
                    message: "Format email tidak valid!",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-slate-400" />}
                  placeholder="nama@domain.com"
                  className="rounded-xl py-2"
                />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  label={
                    <span className="font-semibold text-slate-700 text-xs">
                      Peran Sistem (Role)
                    </span>
                  }
                  name="role"
                  rules={[{ required: true, message: "Pilih peran pengguna!" }]}
                >
                  <Select options={roleOptions} className="rounded-xl h-10" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-semibold text-slate-700 text-xs">
                      Status Akun
                    </span>
                  }
                  name="is_active"
                  valuePropName="checked"
                >
                  <div className="flex items-center gap-2.5 pt-1.5">
                    <Switch />
                    <span className="text-xs text-slate-500 font-medium">
                      Aktif
                    </span>
                  </div>
                </Form.Item>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <Button
                  onClick={() => setIsEditProfileModalOpen(false)}
                  disabled={updatingProfile}
                  className="rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={updatingProfile}
                  className="rounded-xl font-medium shadow-xs"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </Form>
          </Modal>

          {/* Modal 2: Change Password (PATCH /users/me/password) */}
          <Modal
            title={
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-1">
                <LockOutlined className="text-indigo-500" />
                <span>Ubah Kata Sandi Akun</span>
              </div>
            }
            open={isChangePasswordModalOpen}
            onCancel={() =>
              !updatingPassword && setIsChangePasswordModalOpen(false)
            }
            footer={null}
            destroyOnClose={false}
            centered
            className="rounded-2xl"
          >
            <Form
              form={passwordFormModal}
              layout="vertical"
              onFinish={(values) => handleUpdatePassword(values, true)}
              className="pt-2"
            >
              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Kata Sandi Lama (old_password)
                  </span>
                }
                name="old_password"
                rules={[
                  {
                    required: true,
                    message: "Masukkan kata sandi lama Anda!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400" />}
                  placeholder="Kata sandi saat ini"
                  className="rounded-xl py-2"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Kata Sandi Baru (new_password)
                  </span>
                }
                name="new_password"
                rules={[
                  {
                    required: true,
                    message: "Masukkan kata sandi baru!",
                  },
                  {
                    min: 6,
                    message: "Kata sandi minimal 6 karakter!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<KeyOutlined className="text-slate-400" />}
                  placeholder="Kata sandi baru (min. 6 karakter)"
                  className="rounded-xl py-2"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-semibold text-slate-700 text-xs">
                    Konfirmasi Kata Sandi Baru
                  </span>
                }
                name="confirm_password"
                dependencies={["new_password"]}
                rules={[
                  {
                    required: true,
                    message: "Konfirmasi kata sandi baru!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Konfirmasi kata sandi tidak cocok!"),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<KeyOutlined className="text-slate-400" />}
                  placeholder="Ulangi kata sandi baru"
                  className="rounded-xl py-2"
                />
              </Form.Item>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <Button
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  disabled={updatingPassword}
                  className="rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={updatingPassword}
                  className="rounded-xl font-medium shadow-xs"
                >
                  Perbarui Kata Sandi
                </Button>
              </div>
            </Form>
          </Modal>
        </>
      ) : (
        <Card className="rounded-2xl border border-gray-100 shadow-xs py-12 text-center">
          <div className="text-slate-500 text-sm mb-4">
            Tidak dapat memuat profil pengguna.
          </div>
          <Button type="primary" onClick={() => fetchProfile()}>
            Coba Lagi
          </Button>
        </Card>
      )}
    </div>
  );
}
