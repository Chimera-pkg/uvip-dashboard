import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CameraOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  TrophyOutlined,
  UserAddOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { useUsers } from "../hooks/useUsers";
import {
  useUserFileCounts,
  type UserFileStats,
  type UserMediaItem,
} from "../hooks/useUserFileCounts";
import {
  USER_ROLE_OPTIONS,
  type CreateUserRequest,
  type User,
} from "../api/users.service";
import { formatFileSizeKb, resolveMediaUrl } from "../utils/media";

interface UserWithStats extends User {
  photoCount: number;
  videoCount: number;
  totalFiles: number;
  totalSizeKb: number;
  lastUploadAt: string | null;
  files: UserMediaItem[];
}

const ROLE_TAG_COLORS: Record<string, string> = {
  admin: "blue",
  surveyor: "green",
  planner: "purple",
  officer: "orange",
};

const STATUS_TAG_COLORS: Record<string, string> = {
  COMPLETED: "success",
  PROCESSING: "processing",
  PENDING: "warning",
  FAILED: "error",
};

export default function UsersRolesPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const {
    users,
    loading: loadingUsers,
    error: usersError,
    fetchAllUsers,
    createUser,
    activateUser,
    deactivateUser,
    deleteUser,
  } = useUsers();

  const {
    statsByUser,
    summary,
    loading: loadingCounts,
    progress,
    error: countsError,
    lastUpdated,
    fetchCounts,
  } = useUserFileCounts();

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createForm] = Form.useForm<CreateUserRequest>();

  const [selectedUserDetail, setSelectedUserDetail] =
    useState<UserWithStats | null>(null);
  const [detailTab, setDetailTab] = useState<"all" | "photo" | "video">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadAll = () => {
    fetchAllUsers();
    fetchCounts();
  };

  useEffect(() => {
    fetchAllUsers();
    fetchCounts();
  }, [fetchAllUsers, fetchCounts]);

  const usersWithStats: UserWithStats[] = useMemo(() => {
    return users.map((u) => {
      const stats: UserFileStats | undefined = statsByUser[u.id];
      return {
        ...u,
        photoCount: stats?.photoCount ?? 0,
        videoCount: stats?.videoCount ?? 0,
        totalFiles: stats?.totalFiles ?? 0,
        totalSizeKb: stats?.totalSizeKb ?? 0,
        lastUploadAt: stats?.lastUploadAt ?? null,
        files: stats?.files ?? [],
      };
    });
  }, [users, statsByUser]);

  const filteredUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return usersWithStats.filter((u) => {
      const matchesSearch =
        !query ||
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? u.is_active : !u.is_active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersWithStats, searchText, roleFilter, statusFilter]);

  const activeUserCount = useMemo(
    () => users.filter((u) => u.is_active).length,
    [users],
  );

  const topContributor = useMemo(() => {
    if (usersWithStats.length === 0) return null;
    return usersWithStats.reduce<UserWithStats | null>((best, curr) => {
      if (!best || curr.totalFiles > best.totalFiles) return curr;
      return best;
    }, null);
  }, [usersWithStats]);

  const progressPercent =
    progress.totalPages > 0
      ? Math.round((progress.loadedPages / progress.totalPages) * 100)
      : 0;

  const handleToggleActive = async (record: UserWithStats) => {
    setActionLoadingId(record.id);
    try {
      if (record.is_active) {
        await deactivateUser(record.id);
      } else {
        await activateUser(record.id);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setActionLoadingId(id);
    try {
      await deleteUser(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateUser = async (values: CreateUserRequest) => {
    setSubmittingCreate(true);
    try {
      await createUser(values);
      createForm.resetFields();
      setIsAddModalOpen(false);
      fetchAllUsers();
    } finally {
      setSubmittingCreate(false);
    }
  };

  const detailFiles = useMemo(() => {
    if (!selectedUserDetail) return [];
    if (detailTab === "all") return selectedUserDetail.files;
    return selectedUserDetail.files.filter((f) => f.mediaType === detailTab);
  }, [selectedUserDetail, detailTab]);

  const columns: ColumnsType<UserWithStats> = [
    {
      title: "Pengguna",
      key: "user",
      fixed: "left",
      width: 260,
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      render: (_, record) => {
        const avatarUrl = record.profile_file_path
          ? resolveMediaUrl(record.profile_file_path)
          : undefined;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              size={38}
              src={avatarUrl}
              icon={<UserOutlined />}
              className="shrink-0"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                fontWeight: 600,
              }}
            >
              {record.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800 truncate capitalize">
                  {record.name}
                </span>
                {authUser?.id === record.id && (
                  <Tag color="cyan" className="text-[10px] m-0 px-1.5 py-0">
                    Anda
                  </Tag>
                )}
              </div>
              <div className="text-xs text-slate-400 truncate font-mono">
                {record.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      sorter: (a, b) => (a.role || "").localeCompare(b.role || ""),
      render: (role: string) => (
        <Tag
          color={ROLE_TAG_COLORS[role] || "default"}
          className="uppercase font-semibold text-[11px] rounded-md"
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      sorter: (a, b) => Number(a.is_active) - Number(b.is_active),
      render: (isActive: boolean) =>
        isActive ? (
          <Tag
            color="success"
            icon={<CheckCircleOutlined />}
            className="rounded-md text-xs"
          >
            Aktif
          </Tag>
        ) : (
          <Tag
            color="error"
            icon={<CloseCircleOutlined />}
            className="rounded-md text-xs"
          >
            Non-aktif
          </Tag>
        ),
    },
    {
      title: (
        <span className="inline-flex items-center gap-1">
          <CameraOutlined className="text-blue-500" />
          <span>Foto</span>
        </span>
      ),
      dataIndex: "photoCount",
      key: "photoCount",
      width: 100,
      align: "center",
      sorter: (a, b) => a.photoCount - b.photoCount,
      render: (count: number) => (
        <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full text-xs">
          {count.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      title: (
        <span className="inline-flex items-center gap-1">
          <VideoCameraOutlined className="text-purple-500" />
          <span>Video</span>
        </span>
      ),
      dataIndex: "videoCount",
      key: "videoCount",
      width: 100,
      align: "center",
      sorter: (a, b) => a.videoCount - b.videoCount,
      render: (count: number) => (
        <span className="font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full text-xs">
          {count.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      title: "Total File",
      key: "totalFiles",
      width: 145,
      defaultSortOrder: "descend",
      sorter: (a, b) => a.totalFiles - b.totalFiles,
      render: (_, record) => (
        <div>
          <div className="font-bold text-slate-800 text-sm">
            {record.totalFiles.toLocaleString("id-ID")} file
          </div>
          <div className="text-[11px] text-slate-400">
            {formatFileSizeKb(record.totalSizeKb)}
          </div>
        </div>
      ),
    },
    {
      title: "Login Terakhir",
      dataIndex: "last_login_at",
      key: "last_login_at",
      width: 160,
      sorter: (a, b) =>
        (a.last_login_at || "").localeCompare(b.last_login_at || ""),
      render: (val: string | null | undefined) => (
        <span className="text-xs text-slate-500">
          {val ? dayjs(val).format("DD MMM YYYY, HH:mm") : "Belum pernah"}
        </span>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      width: 150,
      render: (_, record) => {
        const isSelf = authUser?.id === record.id;
        const isRowLoading = actionLoadingId === record.id;

        return (
          <Space size="small">
            <Tooltip title="Lihat Daftar File">
              <Button
                type="text"
                size="small"
                icon={<FolderOpenOutlined />}
                className="text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  setSelectedUserDetail(record);
                  setDetailTab("all");
                }}
              />
            </Tooltip>

            <Popconfirm
              title={
                record.is_active
                  ? "Non-aktifkan pengguna ini?"
                  : "Aktifkan kembali pengguna ini?"
              }
              description={
                record.is_active
                  ? "Pengguna tidak akan bisa login sampai diaktifkan lagi."
                  : "Pengguna akan dapat mengakses sistem kembali."
              }
              onConfirm={() => handleToggleActive(record)}
              okText="Ya"
              cancelText="Batal"
              disabled={isSelf}
            >
              <Tooltip
                title={
                  isSelf
                    ? "Tidak dapat mengubah status akun sendiri"
                    : record.is_active
                      ? "Non-aktifkan"
                      : "Aktifkan"
                }
              >
                <Button
                  type="text"
                  size="small"
                  loading={isRowLoading}
                  disabled={isSelf}
                  icon={
                    record.is_active ? (
                      <StopOutlined className="text-amber-500" />
                    ) : (
                      <CheckCircleOutlined className="text-emerald-600" />
                    )
                  }
                />
              </Tooltip>
            </Popconfirm>

            <Popconfirm
              title="Hapus pengguna ini?"
              description="Data pengguna akan dihapus permanen."
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Hapus"
              cancelText="Batal"
              okButtonProps={{ danger: true }}
              disabled={isSelf}
            >
              <Tooltip
                title={
                  isSelf ? "Tidak dapat menghapus akun sendiri" : "Hapus User"
                }
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  loading={isRowLoading}
                  disabled={isSelf}
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const detailColumns: ColumnsType<UserMediaItem> = [
    {
      title: "Tipe",
      dataIndex: "mediaType",
      key: "mediaType",
      width: 90,
      render: (type: "photo" | "video") =>
        type === "photo" ? (
          <Tag color="blue" icon={<CameraOutlined />}>
            Foto
          </Tag>
        ) : (
          <Tag color="purple" icon={<VideoCameraOutlined />}>
            Video
          </Tag>
        ),
    },
    {
      title: "Nama File",
      dataIndex: "originalFilename",
      key: "originalFilename",
      ellipsis: true,
      render: (name: string) => (
        <span className="font-medium text-slate-700 text-xs">{name}</span>
      ),
    },
    {
      title: "Project",
      dataIndex: "projectName",
      key: "projectName",
      width: 150,
      ellipsis: true,
      render: (name: string | null) => (
        <span className="text-xs text-slate-600">{name || "Unassigned"}</span>
      ),
    },
    {
      title: "Jalan / Lokasi",
      dataIndex: "streetName",
      key: "streetName",
      width: 150,
      ellipsis: true,
      render: (street: string | null) => (
        <span className="text-xs text-slate-500">{street || "-"}</span>
      ),
    },
    {
      title: "Ukuran",
      dataIndex: "fileSizeKb",
      key: "fileSizeKb",
      width: 90,
      render: (kb: number) => (
        <span className="text-xs text-slate-500">{formatFileSizeKb(kb)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "processingStatus",
      key: "processingStatus",
      width: 110,
      render: (status: string) => (
        <Tag
          color={STATUS_TAG_COLORS[status] || "default"}
          className="text-[11px]"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Tanggal",
      key: "date",
      width: 135,
      render: (_, item) => {
        const dt = item.createdAt || item.capturedAt;
        return (
          <span className="text-xs text-slate-500">
            {dt ? dayjs(dt).format("DD MMM YYYY, HH:mm") : "-"}
          </span>
        );
      },
    },
    {
      title: "Lihat",
      key: "open",
      width: 70,
      align: "center",
      render: (_, item) => (
        <Tooltip title="Buka Hasil Segmentasi">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              const basePath =
                item.mediaType === "photo"
                  ? `/street-photos/segmentation-result/${item.id}`
                  : `/street-videos/segmentation-result/${item.id}`;
              setSelectedUserDetail(null);
              navigate(basePath, {
                state: {
                  originalFilename: item.originalFilename,
                  projectId: item.projectId,
                },
              });
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-10 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-1">
            Pengguna & Statistik File
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm m-0">
            Daftar seluruh pengguna terdaftar beserta total file foto & video
            yang telah diunggah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            icon={<ReloadOutlined spin={loadingUsers || loadingCounts} />}
            onClick={loadAll}
            disabled={loadingUsers || loadingCounts}
            className="rounded-lg font-medium"
          >
            Refresh Data
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-lg font-medium shadow-xs"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              border: "none",
            }}
          >
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Counting Progress / Errors */}
      {loadingCounts && (
        <Card className="rounded-xl border border-blue-100 bg-blue-50/40 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs sm:text-sm font-medium text-blue-700">
              Menghitung file foto & video per pengguna... (halaman{" "}
              {progress.loadedPages} dari {progress.totalPages})
            </span>
            <span className="text-xs font-semibold text-blue-600">
              {progressPercent}%
            </span>
          </div>
          <Progress
            percent={progressPercent}
            showInfo={false}
            size="small"
            strokeColor="#2563eb"
          />
        </Card>
      )}

      {(usersError || countsError) && (
        <Alert
          type="error"
          showIcon
          message="Sebagian data gagal dimuat"
          description={usersError || countsError}
          className="rounded-xl"
        />
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Pengguna
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {users.length.toLocaleString("id-ID")}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {activeUserCount} aktif · {users.length - activeUserCount}{" "}
                non-aktif
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <UserOutlined />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Foto
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {summary.totalPhotos.toLocaleString("id-ID")}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Ukuran: {formatFileSizeKb(summary.totalPhotoSizeKb)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg">
              <CameraOutlined />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Video
              </div>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {summary.totalVideos.toLocaleString("id-ID")}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Ukuran: {formatFileSizeKb(summary.totalVideoSizeKb)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
              <VideoCameraOutlined />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Kontributor Teraktif
              </div>
              <div className="text-base font-bold text-slate-800 mt-1.5 truncate capitalize">
                {topContributor && topContributor.totalFiles > 0
                  ? topContributor.name
                  : "-"}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                {topContributor && topContributor.totalFiles > 0
                  ? `${topContributor.totalFiles.toLocaleString("id-ID")} file (${topContributor.photoCount} foto, ${topContributor.videoCount} video)`
                  : "Belum ada unggahan"}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg shrink-0">
              <TrophyOutlined />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Table Card */}
      <Card
        className="rounded-2xl border border-gray-100 shadow-xs overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Cari nama atau email pengguna..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="sm:max-w-xs rounded-lg"
            />

            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              className="w-full sm:w-40"
              options={[
                { value: "all", label: "Semua Role" },
                ...USER_ROLE_OPTIONS,
              ]}
            />

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-40"
              options={[
                { value: "all", label: "Semua Status" },
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Non-aktif" },
              ]}
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <FileOutlined />
              <span>
                Menampilkan {filteredUsers.length} dari {users.length} pengguna
              </span>
            </span>
            {lastUpdated && (
              <span className="hidden sm:inline">
                · Diperbarui {dayjs(lastUpdated).format("HH:mm:ss")}
              </span>
            )}
          </div>
        </div>

        <Table<UserWithStats>
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loadingUsers}
          scroll={{ x: 960 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "25", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} pengguna`,
            className: "px-4 py-3",
          }}
        />
      </Card>

      {/* Modal: Tambah Pengguna Baru (POST /auth/register) */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <UserAddOutlined className="text-blue-600" />
            <span>Tambah Pengguna Baru</span>
          </span>
        }
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        confirmLoading={submittingCreate}
        okText="Daftarkan Pengguna"
        cancelText="Batal"
        destroyOnHidden
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateUser}
          initialValues={{ role: "surveyor" }}
          className="mt-3"
        >
          <Form.Item
            name="name"
            label="Nama Lengkap"
            rules={[{ required: true, message: "Nama lengkap wajib diisi" }]}
          >
            <Input placeholder="Contoh: Budi Santoso" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Alamat Email"
            rules={[
              { required: true, message: "Email wajib diisi" },
              { type: "email", message: "Format email tidak valid" },
            ]}
          >
            <Input placeholder="nama@domain.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Kata Sandi"
            rules={[
              { required: true, message: "Kata sandi wajib diisi" },
              { min: 6, message: "Minimal 6 karakter" },
            ]}
          >
            <Input.Password placeholder="Minimal 6 karakter" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role Pengguna"
            rules={[{ required: true, message: "Pilih role pengguna" }]}
          >
            <Select options={USER_ROLE_OPTIONS} placeholder="Pilih role" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Detail File Per User */}
      <Modal
        title={
          selectedUserDetail ? (
            <div className="flex items-center gap-3">
              <Avatar
                size={36}
                src={
                  selectedUserDetail.profile_file_path
                    ? resolveMediaUrl(selectedUserDetail.profile_file_path)
                    : undefined
                }
                icon={<UserOutlined />}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                }}
              >
                {selectedUserDetail.name?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
              <div>
                <div className="font-bold text-slate-800 capitalize leading-tight">
                  File Unggahan: {selectedUserDetail.name}
                </div>
                <div className="text-xs text-slate-400 font-normal">
                  {selectedUserDetail.email} ·{" "}
                  {selectedUserDetail.totalFiles.toLocaleString("id-ID")} file (
                  {formatFileSizeKb(selectedUserDetail.totalSizeKb)})
                </div>
              </div>
            </div>
          ) : (
            "Detail File Pengguna"
          )
        }
        open={Boolean(selectedUserDetail)}
        onCancel={() => setSelectedUserDetail(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedUserDetail(null)}>
            Tutup
          </Button>,
        ]}
        width={920}
      >
        {selectedUserDetail && (
          <div className="space-y-3">
            <Tabs
              activeKey={detailTab}
              onChange={(key) => setDetailTab(key as "all" | "photo" | "video")}
              items={[
                {
                  key: "all",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <span>Semua</span>
                      <Badge
                        count={selectedUserDetail.totalFiles}
                        showZero
                        color="#475569"
                      />
                    </span>
                  ),
                },
                {
                  key: "photo",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <CameraOutlined />
                      <span>Foto</span>
                      <Badge
                        count={selectedUserDetail.photoCount}
                        showZero
                        color="#2563eb"
                      />
                    </span>
                  ),
                },
                {
                  key: "video",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <VideoCameraOutlined />
                      <span>Video</span>
                      <Badge
                        count={selectedUserDetail.videoCount}
                        showZero
                        color="#9333ea"
                      />
                    </span>
                  ),
                },
              ]}
            />

            <Table<UserMediaItem>
              columns={detailColumns}
              dataSource={detailFiles}
              rowKey={(item) => `${item.mediaType}-${item.id}`}
              size="small"
              scroll={{ x: 760 }}
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} file`,
              }}
              locale={{
                emptyText: "Belum ada file yang diunggah oleh pengguna ini.",
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
