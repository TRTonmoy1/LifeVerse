
import type { CharacterStyle } from "../../components/room/Character";

type Props = {
  character: CharacterStyle;
  onChange: (style: CharacterStyle) => void;
};

const options = {
  skin: ["#f1c7a3", "#c68659", "#8d5524", "#f6d5bc"],
  shirt: ["#8b5cf6", "#0ea5e9", "#16a34a", "#ef4444"],
  hair: ["#211715", "#6b4226", "#d6a45b", "#64748b"],
};

export default function CharacterCustomizer({
  character,
  onChange,
}: Props) {
  return (
    <div className="customizer">
      <h2>Customize your avatar</h2>
      <p>Make LifeVerse feel like your own world.</p>

      {Object.entries(options).map(([category, colors]) => (
        <div className="customizer-group" key={category}>
          <h3>{category}</h3>
          <div className="color-options">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`${category}: ${color}`}
                aria-pressed={
                  character[category as keyof CharacterStyle] === color
                }
                className={
                  character[category as keyof CharacterStyle] === color
                    ? "color-option selected"
                    : "color-option"
                }
                style={{ backgroundColor: color }}
                onClick={() =>
                  onChange({ ...character, [category]: color })
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
