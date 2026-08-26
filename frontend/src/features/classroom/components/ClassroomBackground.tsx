export default function ClassroomBackground() {
    return (
                <div
                    className="classroom-background"
                    aria-hidden="true"
                >

                    {/* 왼쪽 조명 */}

                    <div className="hanging-lamp">
                        <div className="lamp-wire" />
                        <div className="lamp-shade" />
                        <div className="lamp-light" />
                    </div>


                    {/* 창문 */}

                    <div className="wall-window">

                        <div className="window-sky">

                            <div className="cloud cloud-one" />
                            <div className="cloud cloud-two" />

                            <div className="mountain mountain-one" />
                            <div className="mountain mountain-two" />

                        </div>

                        <div className="window-frame-v" />
                        <div className="window-frame-h" />

                    </div>


                    {/* 게시판 */}

                    <div className="class-board">

            <span className="board-small">
              SMALL STEPS
            </span>

                        <span className="board-big">
              BIG GROWTH
            </span>

                        <div className="board-line" />

                        <span className="board-code">
              RAG / AI LAB
            </span>

                    </div>


                    {/* 왼쪽 화분 */}

                    <div className="left-plant">

                        <div className="plant-leaf leaf-1" />
                        <div className="plant-leaf leaf-2" />
                        <div className="plant-leaf leaf-3" />
                        <div className="plant-leaf leaf-4" />

                        <div className="plant-pot-css" />

                    </div>


                    {/* 책 */}

                    <div className="desk-books">

                        <div className="desk-book book-green" />
                        <div className="desk-book book-red" />
                        <div className="desk-book book-blue" />

                    </div>


                    {/* 머그컵 */}

                    <div className="coffee-cup">
                        <div className="coffee-steam steam-one" />
                        <div className="coffee-steam steam-two" />
                        <div className="cup-body" />
                        <div className="cup-handle" />
                    </div>


                    {/* 고양이 */}

                    <div className="pixel-cat">

                        <div className="cat-tail" />

                        <div className="cat-body">

                            <div className="cat-head">

                                <div className="cat-ear left-ear" />
                                <div className="cat-ear right-ear" />

                                <div className="cat-face">
                                    <span>•</span>
                                    <span>ᴗ</span>
                                    <span>•</span>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* 책상 */}

                    <div className="desk-surface" />

                </div>
    );
}
