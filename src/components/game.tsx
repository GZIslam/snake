import {Space} from "canv";
import { useEffect, useRef, useState } from "react";
import styles from "./game.module.scss";

// game config
const cellSize = 10;
const fieldSize = 800;
const sideSize = fieldSize/2;

const getRandomPos = () => {
    return Math.floor(Math.random() * 80 - 40) * cellSize;
}

const processPos = (pos: number) => {
    if(pos >= sideSize) return -sideSize;
    if(pos < -sideSize) return sideSize - cellSize;
    return pos
}

export const Game = () => {
    const ref = useRef(null);
    const speed = useRef(300);
    const length = useRef(1);
    const animation = useRef<number>();
    const start = useRef<() => void>(() => {});
    const isRemoving = useRef(false);
    const [score, setScore] = useState(0);
    const [lengthText, setLengthText] = useState(1);
    const [speedText, setSpeedText] = useState(speed.current);

    let applePosition = {x: getRandomPos(), y: getRandomPos()};
    let direction = {x: 0, y: cellSize};
    let currentDirection = direction;

    const modifyLength = (value: number) => {
        if(value <= 0) value = 1;
        if(value < length.current) isRemoving.current = true;
        length.current = value;
        setLengthText(value);
    }

    const modifySpeed = (value: number) => {
        if(value <= 0) value = 1;
        clearInterval(animation.current);
        speed.current = value;
        start.current();
        setSpeedText(speed.current);
    }

    const onKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            case "ArrowUp":
            case "w":
                if(currentDirection.y === cellSize) return
                direction = {x: 0, y: -cellSize};
                break;
            case "ArrowDown":
            case "s":
                if(currentDirection.y === -cellSize) return
                direction = {x: 0, y: cellSize};
                break;
            case "ArrowLeft":
            case "a":
                if(currentDirection.x === cellSize) return
                direction = {x: -cellSize, y: 0};
                break;
            case "ArrowRight":
            case "d":
                if(currentDirection.x === -cellSize) return
                direction = {x: cellSize, y: 0};
                break;
        }
    }

    useEffect(() => {
        if(!ref.current) return
        document.addEventListener("keydown", onKeyDown);

        const s = Space(ref.current, {scale: 1});
        const snake = s.addDrawable({
            data: {
                pos: [{x: 0, y: 0}]
            },
            x: 0, y: 0,
            draw(ctx){
                this.data.pos.forEach((p: {x: number, y: number}, index: number) => {
                    ctx.beginPath();
                    ctx.rect(p.x, p.y, cellSize, cellSize);
                    index % 2 === 0 ? ctx.fillStyle = "#0fa334" : ctx.fillStyle = "#0cc339";
                    if(index === 0) ctx.fillStyle = "#225c30";
                    ctx.fill();
                    ctx.closePath();
                })
            }
        });
        s.addDrawable({
            x: 0, y: 0,
            draw(ctx){
                ctx.beginPath();
                ctx.fillStyle = "#cd5c76";
                ctx.rect(applePosition.x, applePosition.y, cellSize, cellSize);
                ctx.fill();
                ctx.closePath();
            }
        });
        s.draw();
        start.current = () => {
            animation.current = setInterval(() => {
                const head = snake.data.pos[0]
                snake.data.pos.unshift({x: processPos(head.x + direction.x), y: processPos(head.y + direction.y)});
                currentDirection = direction;
                if(isRemoving.current) {
                    isRemoving.current = false;
                    return snake.data.pos.splice(length.current)
                }
                if((head.x !== applePosition.x || head.y !== applePosition.y) && length.current < snake.data.pos.length){
                    snake.data.pos.pop();
                } else {
                    if(length.current < snake.data.pos.length) {
                        setScore(prev => prev + 1);
                        setLengthText(snake.data.pos.length);
                        applePosition = {x: getRandomPos(), y: getRandomPos()};
                        if(speed.current > 0) {
                            modifySpeed(speed.current - speed.current / (5 * (score + 1)));
                        }
                    }
                }
                s.draw();
            }, speed.current);
        }
        start.current();

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            clearInterval(animation.current);
        }
    }, [])
    
    return <>
        <div className={styles.game}>
            <div className={styles.gradientBorder}>
                <canvas ref={ref}></canvas>
            </div>
            <div className={styles.controls}>
                <h2>
                    Score: {score}
                </h2>
                <div className={styles.field}>
                    <p>Speed:</p>
                    <div className={styles.row}>
                        <input
                            value={speedText}
                            onChange={e => modifySpeed(+e.target.value)}
                            type="number"
                        />
                        <button onClick={() => speed.current > 20 && modifySpeed(speed.current - 20)}>-</button>
                        <button onClick={() => modifySpeed(speed.current + 20)}>+</button>
                    </div>
                </div>
                <div className={styles.field}>
                    <p>Length:</p>
                    <div className={styles.row}>
                        <input
                            value={lengthText}
                            onChange={e => modifyLength(+e.target.value)}
                            type="number"
                        />
                        <button onClick={() => modifyLength(length.current - 1)}>-</button>
                        <button onClick={() => modifyLength(length.current + 1)}>+</button>
                    </div>
                </div>
            </div>
        </div>
    </>
}