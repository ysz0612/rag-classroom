import { Canvas, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    Text,
    Grid,
} from "@react-three/drei";

import {
    useMemo,
    useRef,
} from "react";

import * as THREE from "three";

import "./pca-visualizer.css";


/* =========================================================
   TYPES
========================================================= */

export type PCADimension = "2D" | "3D";


interface PCAVisualizerProps {
    dimension?: PCADimension;

    autoRotate?: boolean;

    highlightPC1?: boolean;

    onClose?: () => void;
}


interface PCADataPoint {
    id: number;

    label: string;

    group: "query" | "near" | "middle" | "far";

    position: [
        number,
        number,
        number
    ];
}


/* =========================================================
   SAMPLE PCA DATA

   현재는 시각화 동작 확인용 데이터.
   이후 실제 embedding → PCA 결과로 교체 가능.
========================================================= */

const SAMPLE_POINTS: PCADataPoint[] = [

    {
        id: 1,
        label: "질문",
        group: "query",
        position: [0.2, 0.1, 0.3],
    },

    {
        id: 2,
        label: "문서 A",
        group: "near",
        position: [0.7, 0.35, 0.55],
    },

    {
        id: 3,
        label: "문서 B",
        group: "near",
        position: [0.9, -0.1, 0.35],
    },

    {
        id: 4,
        label: "문서 C",
        group: "middle",
        position: [-0.5, 0.8, 0.4],
    },

    {
        id: 5,
        label: "문서 D",
        group: "middle",
        position: [-0.8, -0.5, 0.8],
    },

    {
        id: 6,
        label: "문서 E",
        group: "far",
        position: [-1.5, 1.1, -0.6],
    },

    {
        id: 7,
        label: "문서 F",
        group: "far",
        position: [1.6, -1.2, -0.8],
    },

];


/* =========================================================
   POINT
========================================================= */

function DataPoint({
                       point,
                       dimension,
                   }: {
    point: PCADataPoint;
    dimension: PCADimension;
}) {

    const position = useMemo<
        [number, number, number]
    >(() => {

        if (dimension === "2D") {

            return [
                point.position[0],
                point.position[1],
                0,
            ];
        }

        return point.position;

    }, [
        point,
        dimension,
    ]);


    const pointColor = {

        query: "#d59a3f",

        near: "#5f916c",

        middle: "#5d84a0",

        far: "#9a8176",

    }[point.group];


    const radius =
        point.group === "query"
            ? 0.13
            : 0.09;


    return (
        <group position={position}>

            <mesh>

                <sphereGeometry
                    args={[
                        radius,
                        24,
                        24,
                    ]}
                />

                <meshStandardMaterial
                    color={pointColor}
                />

            </mesh>


            <Text
                position={[
                    0,
                    radius + 0.11,
                    0,
                ]}
                fontSize={0.09}
                color="#243f52"
                anchorX="center"
                anchorY="middle"
            >
                {point.label}
            </Text>

        </group>
    );
}


/* =========================================================
   AXIS
========================================================= */

function Axis({
                  highlightPC1,
              }: {
    highlightPC1: boolean;
}) {

    return (
        <group>

            {/* PC1 */}

            <mesh
                position={[
                    0,
                    -1.65,
                    0,
                ]}
            >

                <boxGeometry
                    args={[
                        4,
                        highlightPC1
                            ? 0.035
                            : 0.018,
                        0.018,
                    ]}
                />

                <meshBasicMaterial
                    color={
                        highlightPC1
                            ? "#c17655"
                            : "#718493"
                    }
                />

            </mesh>


            <Text
                position={[
                    2.15,
                    -1.65,
                    0,
                ]}
                fontSize={0.11}
                color={
                    highlightPC1
                        ? "#b46649"
                        : "#566b79"
                }
            >
                PC1
            </Text>


            {/* PC2 */}

            <mesh
                position={[
                    -1.9,
                    0,
                    0,
                ]}
            >

                <boxGeometry
                    args={[
                        0.018,
                        3.4,
                        0.018,
                    ]}
                />

                <meshBasicMaterial
                    color="#718493"
                />

            </mesh>


            <Text
                position={[
                    -1.9,
                    1.9,
                    0,
                ]}
                fontSize={0.11}
                color="#566b79"
            >
                PC2
            </Text>


            {/* PC3 */}

            <mesh
                position={[
                    -1.9,
                    -1.65,
                    0,
                ]}
                rotation={[
                    0,
                    Math.PI / 2,
                    0,
                ]}
            >

                <boxGeometry
                    args={[
                        0.018,
                        0.018,
                        3,
                    ]}
                />

                <meshBasicMaterial
                    color="#718493"
                />

            </mesh>


            <Text
                position={[
                    -1.9,
                    -1.65,
                    1.7,
                ]}
                fontSize={0.11}
                color="#566b79"
            >
                PC3
            </Text>

        </group>
    );
}


/* =========================================================
   SCENE
========================================================= */

function PCAScene({
                      dimension,
                      autoRotate,
                      highlightPC1,
                  }: {
    dimension: PCADimension;
    autoRotate: boolean;
    highlightPC1: boolean;
}) {

    const groupRef =
        useRef<THREE.Group>(null);


    useFrame(
        (_, delta) => {

            if (
                autoRotate &&
                groupRef.current &&
                dimension === "3D"
            ) {

                groupRef.current.rotation.y +=
                    delta * 0.22;
            }

        }
    );


    return (
        <>

            <ambientLight
                intensity={1.6}
            />

            <directionalLight
                position={[
                    4,
                    5,
                    4,
                ]}
                intensity={2}
            />


            {dimension === "3D" && (
                <Grid
                    position={[0, -1.66, 0]}
                    args={[8, 8]}
                    cellSize={0.35}
                    cellThickness={0.6}
                    sectionSize={1.4}
                    sectionThickness={1}
                    fadeDistance={10}
                    fadeStrength={1}
                    infiniteGrid={false}
                />
            )}

            <group
                ref={groupRef}
                rotation={
                    dimension === "3D"
                        ? [-0.08, -0.22, 0]
                        : [0, 0, 0]
                }
            >

                <Axis
                    highlightPC1={
                        highlightPC1
                    }
                />


                {SAMPLE_POINTS.map(
                    (point) => (

                        <DataPoint
                            key={point.id}
                            point={point}
                            dimension={dimension}
                        />

                    )
                )}

            </group>


            <OrbitControls
                makeDefault
                target={[0, -0.15, 0]}
                enablePan
                enableZoom
                enableRotate={dimension === "3D"}
                minDistance={3.5}
                maxDistance={10}
            />

        </>
    );
}


/* =========================================================
   MAIN
========================================================= */

export default function PCAVisualizer({
                                          dimension = "3D",
                                          autoRotate = false,
                                          highlightPC1 = false,
                                          onClose,
                                      }: PCAVisualizerProps) {

    return (
        <div className="pca-visualizer">

            {/* =================================================
                TOP BAR
            ================================================= */}

            <header className="pca-visualizer-header">

                <div>

                    <small>
                        LIVE VISUALIZATION
                    </small>

                    <h2>
                        PCA · Principal Component Analysis
                    </h2>

                </div>


                <div className="pca-header-status">

                    <span>
                        {dimension}
                    </span>

                    {autoRotate && (
                        <span>
                            AUTO ROTATE
                        </span>
                    )}

                    {highlightPC1 && (
                        <span>
                            PC1 ACTIVE
                        </span>
                    )}


                    {onClose && (

                        <button
                            type="button"
                            onClick={onClose}
                        >
                            ×
                        </button>

                    )}

                </div>

            </header>


            {/* =================================================
                INFO
            ================================================= */}

            <div className="pca-info">

                <strong>
                    고차원 임베딩을
                    주요 성분으로 축소한 공간
                </strong>

                <span>
                    가까운 점일수록
                    원래 벡터의 특성이
                    서로 비슷합니다.
                </span>

            </div>


            {/* =================================================
                CANVAS
            ================================================= */}

            <div
                className="pca-canvas"
                style={{ position: "relative" }}
            >

                {dimension === "3D" && (
                    <div
                        style={{
                            position: "absolute",
                            zIndex: 5,
                            top: 12,
                            left: 14,
                            padding: "7px 10px",
                            border: "1px solid #9aabb5",
                            background: "rgba(244, 241, 233, 0.92)",
                            color: "#385366",
                            fontSize: 11,
                            pointerEvents: "none",
                        }}
                    >
                        3D SPACE · 드래그하여 회전 / 휠로 확대
                    </div>
                )}

                <Canvas
                    camera={{
                        position:
                            dimension === "3D"
                                ? [
                                    5.8,
                                    4.2,
                                    6.8,
                                ]
                                : [
                                    0,
                                    0,
                                    5,
                                ],

                        fov: 38,
                    }}
                >

                    <PCAScene
                        dimension={dimension}
                        autoRotate={autoRotate}
                        highlightPC1={highlightPC1}
                    />

                </Canvas>

            </div>


            {/* =================================================
                LEGEND
            ================================================= */}

            <footer className="pca-legend">

                <div>
                    <i className="query" />
                    질문 벡터
                </div>

                <div>
                    <i className="near" />
                    높은 유사도
                </div>

                <div>
                    <i className="middle" />
                    중간 유사도
                </div>

                <div>
                    <i className="far" />
                    낮은 유사도
                </div>

            </footer>

        </div>
    );
}