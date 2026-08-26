/*
 * 학습 기록이 sessionStorage에 저장되므로
 * 실험실 권한도 같은 브라우저 세션에서 관리합니다.
 * v2 키로 과거 localStorage의 영구 잠금값을 무시합니다.
 */
const LAB_UNLOCK_KEY =
    "rag-lab-unlocked-v2";

const LAB_PROGRESS_KEY =
    "rag-lab-progress-v2";


export function getLabUnlockKey(
    userId: number,
) {
    return `${LAB_UNLOCK_KEY}:${userId}`;
}


export function getLabProgressKey(
    userId: number,
) {
    return `${LAB_PROGRESS_KEY}:${userId}`;
}


export function isLabUnlocked(
    userId: number,
) {
    const progress = Number(
        sessionStorage.getItem(
            getLabProgressKey(userId),
        ) ?? "0",
    );

    return (
        progress >= 100 &&
        sessionStorage.getItem(
            getLabUnlockKey(userId),
        ) === "true"
    );
}


export function saveLabProgress(
    userId: number,
    progress: number,
) {
    sessionStorage.setItem(
        getLabProgressKey(userId),
        String(progress),
    );
}


export function unlockLab(
    userId: number,
) {
    sessionStorage.setItem(
        getLabUnlockKey(userId),
        "true",
    );
}


export function lockLab(
    userId: number,
) {
    sessionStorage.removeItem(
        getLabUnlockKey(userId),
    );

    /* 과거 버전에서 남긴 영구 잠금값도 제거합니다. */
    localStorage.removeItem(
        `rag-lab-unlocked:${userId}`,
    );
}