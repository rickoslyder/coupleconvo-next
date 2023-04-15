// src/components/GameMode/GameMode.tsx
import React from 'react';
import { GameModeEnum } from '@/types';
import styles from './GameMode.module.css';

interface GameModeProps {
    onChange: (mode: GameModeEnum) => void;
}

const GameMode: React.FC<GameModeProps> = ({ onChange }) => {
    const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value as GameModeEnum);
    };

    return (
        <div className={styles.gameMode}>
            <h2>Choose game mode</h2>
            <label>
                <input
                    type="radio"
                    name="game-mode"
                    value={GameModeEnum.Timed}
                    onChange={handleModeChange}
                />
                Timed mode
            </label>
            <label>
                <input
                    type="radio"
                    name="game-mode"
                    value={GameModeEnum.Unlimited}
                    onChange={handleModeChange}
                />
                Unlimited mode
            </label>
        </div>
    );
};

export default GameMode;

