import { User, Section, Template, Document, AIRequest, AIResponse } from '../types/pdfCreator';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Auth
  async register(userData: { email: string; password: string; name?: string }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error al registrar usuario');
    return response.json();
  }

  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Error al iniciar sesión');
    return response.json();
  }

  async getCurrentUser(userId: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me/${userId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
  }

  // Sections
  async getSections(): Promise<Section[]> {
    const response = await fetch(`${API_BASE_URL}/sections`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener secciones');
    return response.json();
  }

  async createSection(sectionData: Omit<Section, 'id' | 'createdAt'>): Promise<Section> {
    const response = await fetch(`${API_BASE_URL}/sections`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(sectionData),
    });
    if (!response.ok) throw new Error('Error al crear sección');
    return response.json();
  }

  async updateSection(id: string, updates: Partial<Section>): Promise<Section> {
    const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Error al actualizar sección');
    return response.json();
  }

  async deleteSection(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar sección');
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener plantillas');
    return response.json();
  }

  async getTemplate(id: string): Promise<Template> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener plantilla');
    return response.json();
  }

  async createTemplate(templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(templateData),
    });
    if (!response.ok) throw new Error('Error al crear plantilla');
    return response.json();
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Error al actualizar plantilla');
    return response.json();
  }

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar plantilla');
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener documentos');
    return response.json();
  }

  async getDocument(id: string): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener documento');
    return response.json();
  }

  async saveDocument(documentData: Omit<Document, 'id' | 'lastModified'>): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(documentData),
    });
    if (!response.ok) throw new Error('Error al guardar documento');
    return response.json();
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Error al actualizar documento');
    return response.json();
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar documento');
  }

  async exportDocumentToPDF(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/export`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al exportar documento');
    return response.blob();
  }

  // AI
  async generateSection(request: AIRequest): Promise<AIResponse> {
    const response = await fetch(`${API_BASE_URL}/ai/generate-section`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Error al generar sección con IA');
    return response.json();
  }

  async generateDocument(request: { prompt: string; sections: string[] }): Promise<AIResponse> {
    const response = await fetch(`${API_BASE_URL}/ai/generate-document`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Error al generar documento con IA');
    return response.json();
  }
}

export const apiClient = new ApiClient();
