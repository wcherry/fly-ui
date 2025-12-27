import axios from 'axios';
import { time } from 'console';
import { access } from 'fs';

interface FileRecord {
    accessLevel: number,
    active: boolean,
    createdAt: string,
    createdBy: number,
    description?: string,
    folderId: string,
    id: string,
    mediaType?: string,
    originalFilename?: string,
    ownerId: number,
    title: string,
    updatedAt: string,
    updatedBy: number
}

export async function retrieveFolderList(folderId: string): Promise<any[]> {
    let user = JSON.parse(localStorage.getItem("authenticatedUser") || '{}');
    try {
        const response = await axios.get<any[]>(`/api/folders/${folderId}/contents`, {
            headers: {
                'Authorization': `Bearer ${user.token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to retrieve folder list:', error);
        throw error;
    }
}

export async function retrieveFileList(folderId: string): Promise<any[]> {
    let user = JSON.parse(localStorage.getItem("authenticatedUser") || '{}');
    try {
        const response = await axios.get<any[]>(`/api/files?folderId=${folderId}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to retrieve file list in folder:', error);
        throw error;
    }
}

/*
    pub access_level: i32,
    pub title: String,
    pub folder_id: String,
    pub media_type: Option<String>,
    pub description: Option<String>,

*/

/**
 * Uploads happen in two steps:
 * 1. POST to /api/files/ with json data including folderId and file metadata
 * 2. POST to /api/files/upload with form data including the file and the fileId returned from step 1
 * @param folderId 
 * @param file 
 */
export async function createAndUploadFile(folderId: string, file: File): Promise<FileRecord> {
    let user = JSON.parse(localStorage.getItem("authenticatedUser") || '{}');

    let fileMetadata = {
        accessLevel: 0,
        folderId: folderId,
        title: file.name,
        mediaType: file.type,
        description: null
    };

    let fileRec = await axios.post<FileRecord>('/api/files', fileMetadata,{
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
        },
    });

    console.log("File record created, proceeding to upload file data, file id:", fileRec.data.id);

    let formData = new FormData();
    formData.append("file", file);
    let response = await axios.post<FileRecord>(`/api/files/${fileRec.data.id}/upload`, formData, {
    headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'multipart/form-data'
    },
    });
    console.log("File uploaded successfully");
    return response.data;
}



