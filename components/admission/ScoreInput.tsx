"use client";

import { useId, type InputHTMLAttributes } from "react";
import { scoreInputError } from "@/libs/score-input";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "min" | "max" | "step"> & {
  value: string; onValueChange: (value: string) => void; maxScore?: number;
  scoreStep?: number; showRequired?: boolean; errorClassName?: string;
};

export function ScoreInput({ value, onValueChange, maxScore = 10, scoreStep,
  showRequired = false, errorClassName = "text-red-700", ...props }: Props) {
  const generatedId = useId();
  const errorId = `${props.id ?? generatedId}-error`;
  const error = scoreInputError(value, maxScore, scoreStep, showRequired);
  const describedBy = [props["aria-describedby"], error ? errorId : ""].filter(Boolean).join(" ") || undefined;
  return <>
    <input {...props} type="text" inputMode="decimal" value={value}
      aria-invalid={!!error} aria-describedby={describedBy}
      onChange={event => onValueChange(event.target.value)}
      className={`${props.className ?? ""} ${error ? "!border-red-500 focus:!border-red-500" : ""}`} />
    {error && <span id={errorId} role="alert" className={`mt-1.5 block text-xs font-medium leading-5 ${errorClassName}`}>{error}</span>}
  </>;
}
