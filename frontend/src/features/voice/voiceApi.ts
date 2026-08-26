import {
    apiClient,
} from "../../api/client";


export interface VoiceTranscribeResponse {
    text: string;

    original_filename?: string;

    size?: number;

    content_type?: string;
}


/* =========================================================
   VOICE TRANSCRIBE API

   Browser
      ↓
   audio Blob
      ↓
   FormData
      ↓
   FastAPI /api/voice/transcribe
      ↓
   Whisper
      ↓
   text
========================================================= */

export async function transcribeVoice(
    audioBlob: Blob,
): Promise<string> {

    const formData =
        new FormData();


    formData.append(
        "file",
        audioBlob,
        "voice.webm",
    );


    const response =
        await apiClient.post<VoiceTranscribeResponse>(
            "/api/voice/transcribe",
            formData,
        );


    const text =
        response.data.text
            ?.trim()
        ?? "";


    return text;
}