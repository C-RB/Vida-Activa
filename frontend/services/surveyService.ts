import { apiFetch } from "./apiClient";

export interface SurveyCreatePre {
    session_id: string;
    pain_level: number;
    fatigue_level: number;
    mood_level?: number;
    comments?: string;
}

export interface SurveyCreatePost {
    session_id: string;
    mood_level: number;
    // Where it hurt during the exercise; omitted when there was no pain.
    pain_area?: string;
    comments?: string;
}

export const submitPreSurvey = (data: SurveyCreatePre) =>
    apiFetch("/surveys/pre", {
        method: "POST",
        auth: true,
        body: data,
    });

export const submitPostSurvey = (data: SurveyCreatePost) =>
    apiFetch("/surveys/post", {
        method: "POST",
        auth: true,
        body: data,
    });
