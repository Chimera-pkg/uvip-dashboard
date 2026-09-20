import { useState, useCallback } from "react";
import { message } from "antd";
import {
  projectsService,
  type Project,
  type ProjectRequest,
  type PaginatedProjects,
} from "../api/projects.service";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [paginatedData, setPaginatedData] = useState<PaginatedProjects | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (page = 1, size = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsService.getProjects(page, size);
      setPaginatedData(data);
      setProjects(data.data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to fetch projects";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (data: ProjectRequest): Promise<boolean> => {
    try {
      await projectsService.createProject(data);
      message.success("Project created successfully");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to create project";
      message.error(msg);
      return false;
    }
  };

  const updateProject = async (
    id: string,
    data: ProjectRequest,
  ): Promise<boolean> => {
    try {
      await projectsService.updateProject(id, data);
      message.success("Project updated successfully");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to update project";
      message.error(msg);
      return false;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      await projectsService.deleteProject(id);
      message.success("Project deleted successfully");
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to delete project";
      message.error(msg);
      return false;
    }
  };

  return {
    projects,
    paginatedData,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
