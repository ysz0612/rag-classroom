import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";

import ProtectedRoute
    from "../features/auth/ProtectedRoute";

import LabGuard
    from "../features/lab/LabGuard";

import GlobalVoiceAssistant
    from "../features/voiceAssistant/GlobalVoiceAssistant";

import HomePage
    from "../pages/HomePage";

import ClassroomPage
    from "../pages/learn/ClassroomPage";

import RagLabPage
    from "../pages/lab/RagLabPage";


export default function AppRouter() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        <HomePage />
                    }
                />


                <Route
                    path="/classroom"
                    element={
                        <ProtectedRoute>
                            <ClassroomPage />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/lab"
                    element={
                        <ProtectedRoute>

                            <LabGuard>
                                <RagLabPage />
                            </LabGuard>

                        </ProtectedRoute>
                    }
                />


                <Route
                    path="*"
                    element={
                        <HomePage />
                    }
                />

            </Routes>


            {/* 로그인 후 사이트 전체에서 살아있는 요정 */}

            <GlobalVoiceAssistant />

        </BrowserRouter>
    );
}