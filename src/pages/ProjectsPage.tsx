import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useProjects } from "../hooks/useProjects";
import type { Project, ProjectRequest } from "../api/projects.service";

export default function ProjectsPage() {
  const { paginatedData, loading, fetchProjects, createProject, updateProject, deleteProject } = useProjects();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm<ProjectRequest>();

  useEffect(() => {
    fetchProjects(currentPage, pageSize);
  }, [fetchProjects, currentPage, pageSize]);

  const handleAdd = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      name: project.name,
      location: project.location,
      description: project.description,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingProject(null);
  };

  const handleSubmit = async (values: ProjectRequest) => {
    let success = false;
    if (editingProject) {
      success = await updateProject(editingProject.id, values);
    } else {
      success = await createProject(values);
    }

    if (success) {
      setIsModalVisible(false);
      form.resetFields();
      setEditingProject(null);
      fetchProjects(currentPage, pageSize);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Scores (B/S/C)",
      key: "scores",
      render: (_: any, record: Project) => (
        <span className="text-sm text-gray-600">
          {record.beauty_score} / {record.safety_score} / {record.comfort_score}
        </span>
      ),
    },
    {
      title: "UVI Score",
      dataIndex: "uvi_score",
      key: "uvi_score",
      render: (val: number) => <span className="font-bold text-blue-500">{val}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Project) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} className="text-blue-500" onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete the project"
            description="Are you sure to delete this project?"
            onConfirm={async () => {
              const success = await deleteProject(record.id);
              if (success) fetchProjects(currentPage, pageSize);
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
        <h1 className="text-lg font-bold text-gray-800">Projects Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="rounded-lg shadow-lg shadow-blue-500/30"
          style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "none" }}
        >
          Add Project
        </Button>
      </div>

      <Card className="rounded-xl shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={paginatedData?.data || []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: paginatedData?.total_data || 0,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title={editingProject ? "Edit Project" : "Add New Project"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={editingProject ? "Save Changes" : "Create"}
        cancelText="Cancel"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input the project name!" }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please input the project location!" }]}
          >
            <Input placeholder="Enter location (e.g. SBY)" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Enter description" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
