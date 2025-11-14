import { useState, useRef, useEffect, type FC } from 'react';
import '../../styles/components/custom-select.css';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
}

const CustomSelect: FC<CustomSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      document.dispatchEvent(new CustomEvent('dropdown-opened'));
    } else {
      document.dispatchEvent(new CustomEvent('dropdown-closed'));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div
      className={`custom-select-wrapper ${isOpen ? 'open' : ''}`}
      ref={dropdownRef}
    >
      {label && (
        <label htmlFor={id} className="custom-select-label">
          {label}
        </label>
      )}

      <div
        id={id}
        className={`custom-select ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="custom-select-trigger">
          <span className={selectedOption ? '' : 'placeholder'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg
            className={`arrow ${isOpen ? 'rotate' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {isOpen && (
          <div className="custom-select-dropdown">
            {options.length > 5 && (
              <div className="search-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}

            <div className="options-list">
              {filteredOptions.length === 0 ? (
                <div className="no-results">Tidak ada hasil ditemukan</div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`option ${option.value === value ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.value);
                    }}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.label}
                    {option.value === value && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
