import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  Card,
  Select,
  Upload,
  DatePicker,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useStreetPhotos } from "../hooks/useStreetPhotos";
import { useProjects } from "../hooks/useProjects";
import type {
  StreetPhoto,
  StreetPhotoRequest,
} from "../api/street-photos.service";
import dayjs from "dayjs";

export default function StreetPhotosPage() {
  const {
    data,
    loading,
    fetchStreetPhotos,
    createStreetPhoto,
    updateStreetPhoto,
    deleteStreetPhoto,
  } = useStreetPhotos();
  const { projects, fetchProjects, loading: loadingProjects } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<StreetPhoto | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProjects(1, 100);
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchStreetPhotos(selectedProjectId, currentPage, pageSize);
    }
  }, [selectedProjectId, currentPage, pageSize, fetchStreetPhotos]);

  const handleAdd = () => {
    setEditingPhoto(null);
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({
      source: "dashboard_upload",
      captured_at: dayjs(),
      is_manual_capture: true,
      is_offline_sync: false,
    });
    setIsModalVisible(true);
  };

  const handleEdit = (photo: StreetPhoto) => {
    setEditingPhoto(photo);
    setFileList([]);
    form.setFieldsValue({
      source: photo.source,
      latitude: photo.latitude,
      longitude: photo.longitude,
      street_name: photo.street_name,
      captured_at: photo.captured_at ? dayjs(photo.captured_at) : null,
      mission_id: photo.mission_id,
      gps_accuracy_m: photo.gps_accuracy_m,
      compass_azimuth: photo.compass_azimuth,
      exif_timestamp: photo.exif_timestamp ? dayjs(photo.exif_timestamp) : null,
      is_manual_capture: photo.is_manual_capture,
      is_offline_sync: photo.is_offline_sync,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingPhoto(null);
    setFileList([]);
  };

  const handleSubmit = async (values: any) => {
    if (!selectedProjectId) return;

    const requestData: StreetPhotoRequest = {
      project_id: selectedProjectId,
      source: values.source,
      latitude: values.latitude,
      longitude: values.longitude,
      captured_at: values.captured_at
        ? values.captured_at.toISOString()
        : new Date().toISOString(),
      street_name: values.street_name,
      mission_id: values.mission_id,
      gps_accuracy_m: values.gps_accuracy_m,
      compass_azimuth: values.compass_azimuth,
      exif_timestamp: values.exif_timestamp
        ? values.exif_timestamp.toISOString()
        : undefined,
      is_manual_capture: values.is_manual_capture,
      is_offline_sync: values.is_offline_sync,
    };

    if (fileList.length > 0) {
      requestData.file = fileList[0].originFileObj;
    } else if (!editingPhoto) {
      // If creating, file is required based on schema.
      Modal.error({ title: "Error", content: "File is required." });
      return;
    }

    let success = false;
    if (editingPhoto) {
      success = await updateStreetPhoto(editingPhoto.id, requestData);
    } else {
      success = await createStreetPhoto(requestData);
    }

    if (success) {
      setIsModalVisible(false);
      form.resetFields();
      setEditingPhoto(null);
      setFileList([]);
      fetchStreetPhotos(selectedProjectId, currentPage, pageSize);
    }
  };

  const columns = [
    {
      title: "File",
      dataIndex: "original_filename",
      key: "original_filename",
      render: (text: string, record: StreetPhoto) => {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:8000";
        // Assuming file_path doesn't have a leading slash
        const fileUrl = record.file_path.startsWith("http")
          ? record.file_path
          : `${API_BASE_URL}/${record.file_path}`;

        return (
          <div className="flex items-center gap-3">
            <Image
              src={fileUrl}
              alt={text}
              width={64}
              height={48}
              className="object-cover rounded-md border border-gray-200 cursor-pointer"
              fallback="https://via.placeholder.com/64x48?text=Error"
            />
            <div className="flex flex-col">
              <span
                className="font-semibold text-gray-800 text-sm max-w-37.5 truncate"
                title={text}
              >
                {text}
              </span>
              <span className="text-xs text-gray-400">
                {record.file_size_kb} KB
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      render: (_: any, record: StreetPhoto) => (
        <div className="flex flex-col">
          <span className="text-sm">{record.street_name || "Unknown"}</span>
          <span className="text-xs text-gray-400">
            Lat: {record.latitude.toFixed(5)}, Lng:{" "}
            {record.longitude.toFixed(5)}
          </span>
        </div>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Status",
      dataIndex: "processing_status",
      key: "processing_status",
    },
    {
      title: "Captured At",
      dataIndex: "captured_at",
      key: "captured_at",
      render: (val: string) => (
        <span className="text-sm">{dayjs(val).format("YYYY-MM-DD HH:mm")}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: StreetPhoto) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-500"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete photo"
            description="Are you sure to delete this street photo?"
            onConfirm={async () => {
              const success = await deleteStreetPhoto(record.id);
              if (success && selectedProjectId)
                fetchStreetPhotos(selectedProjectId, currentPage, pageSize);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-bold text-gray-800">
          Street Photos Management
        </h1>
        <div className="flex gap-3">
          <Select
            placeholder="Select a Project"
            style={{ width: 250 }}
            loading={loadingProjects}
            onChange={(val) => {
              setSelectedProjectId(val);
              setCurrentPage(1);
            }}
            options={projects.map((p) => ({ label: p.name, value: p.id }))}
            value={selectedProjectId}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            disabled={!selectedProjectId}
            className="rounded-lg shadow-lg shadow-blue-500/30"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              border: "none",
            }}
          >
            Add Photo
          </Button>
        </div>
      </div>

      {selectedProjectId ? (
        <Card
          className="rounded-xl shadow-sm overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: data?.total_data || 0,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white/60 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-gray-500 font-medium">
            Please select a project to view its street photos
          </p>
        </div>
      )}

      <Modal
        title={editingPhoto ? "Edit Street Photo" : "Add Street Photo"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={editingPhoto ? "Save Changes" : "Upload"}
        cancelText="Cancel"
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Photo File" required={!editingPhoto}>
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
            {editingPhoto && (
              <div className="text-xs text-gray-400 mt-1">
                Leave empty to keep existing file.
              </div>
            )}
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="source"
              label="Source"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="e.g. mobile_upload" />
            </Form.Item>
            <Form.Item
              name="captured_at"
              label="Captured At"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="latitude"
              label="Latitude"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber className="w-full" step={0.00001} />
            </Form.Item>
            <Form.Item
              name="longitude"
              label="Longitude"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber className="w-full" step={0.00001} />
            </Form.Item>
          </div>

          <Form.Item name="street_name" label="Street Name">
            <Input placeholder="Optional" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
