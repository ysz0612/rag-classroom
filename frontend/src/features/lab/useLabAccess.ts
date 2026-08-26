import {
    useEffect,
    useState,
} from "react";

import {
    isLabUnlocked,
    lockLab,
    saveLabProgress,
    unlockLab,
} from "./labAccess";


interface UseLabAccessProps {
    userId?: number;
    progress: number;
}


export function useLabAccess({
                                 userId,
                                 progress,
                             }: UseLabAccessProps) {

    const [
        unlocked,
        setUnlocked,
    ] =
        useState(false);


    const [
        justUnlocked,
        setJustUnlocked,
    ] =
        useState(false);


    useEffect(
        () => {

            if (!userId) {
                setUnlocked(false);
                setJustUnlocked(false);
                return;
            }


            saveLabProgress(
                userId,
                progress,
            );


            /* 현재 학습률이 내려가면 실험실도 다시 잠급니다. */
            if (progress < 100) {
                lockLab(userId);
                setUnlocked(false);
                setJustUnlocked(false);
                return;
            }


            const alreadyUnlocked =
                isLabUnlocked(
                    userId,
                );


            /*
             * 이미 예전에 100% 완료한 사용자
             *
             * 다시 들어왔을 때 팝업은 띄우지 않음
             */
            if (alreadyUnlocked) {
                setUnlocked(true);
                setJustUnlocked(false);
                return;
            }


            /*
             * 이번에 처음 100% 달성
             */
            if (progress >= 100) {

                unlockLab(
                    userId,
                );

                setUnlocked(true);

                /*
                 * 바로 Lab으로 보내지 않고
                 * 안내만 띄웁니다.
                 */
                setJustUnlocked(true);
            }

        },
        [
            userId,
            progress,
        ],
    );


    const closeUnlockNotice =
        () => {

            setJustUnlocked(false);
        };


    return {
        unlocked,
        justUnlocked,
        closeUnlockNotice,
    };
}