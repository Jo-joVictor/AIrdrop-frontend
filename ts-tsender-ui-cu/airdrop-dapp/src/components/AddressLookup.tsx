import { useState, type FormEvent } from "react";
import { getAddress, isAddress, type Address } from "viem";

interface Props {
  onSubmit: (address: Address) => void;
  onClose: () => void;
}

export function AddressLookup({ onSubmit, onClose }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!isAddress(trimmed)) {
      setError("Enter a full 0x address (42 characters).");
      return;
    }
    setError(undefined);
    onSubmit(getAddress(trimmed));
  }

  return (
    <form className="lookup" onSubmit={handleSubmit}>
      <label htmlFor="lookup-input" className="lookup-label">
        Check any address (view only)
      </label>
      <div className="lookup-row">
        <input
          id="lookup-input"
          className="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0x..."
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(error)}
        />
        <button type="submit" className="btn btn-primary">
          Check address
        </button>
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Cancel
        </button>
      </div>
      {error && <p className="lookup-error">{error}</p>}
    </form>
  );
}
