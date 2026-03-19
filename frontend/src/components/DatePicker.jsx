import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const DatePicker = ({
  value = "",
  onChange,
  placeholder = "DD-MM-YYYY",
  minDate = null,
  maxDate = null,
  name = "date",
  error = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [displayValue, setDisplayValue] = useState(value);
  const containerRef = useRef(null);

  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  // Convert DD-MM-YYYY to YYYY-MM-DD format (for backend)
  const parseDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    if (day.length !== 2 || month.length !== 2 || year.length !== 4) return "";
    return `${year}-${month}-${day}`;
  };

  // Update display value when prop changes
  useEffect(() => {
    setDisplayValue(formatDisplayDate(value));
    if (value) {
      const date = new Date(value);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [value]);

  // Handle input change
  const handleInputChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    let formatted = "";

    if (input.length >= 1) {
      formatted = input.slice(0, 2);
    }
    if (input.length >= 3) {
      formatted += "-" + input.slice(2, 4);
    }
    if (input.length >= 5) {
      formatted += "-" + input.slice(4, 8);
    }

    setDisplayValue(formatted);

    // If complete date, validate and update
    if (formatted.length === 10 && formatted.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const isoDate = parseDate(formatted);
      if (isoDate) {
        const date = new Date(isoDate);
        if (!isNaN(date.getTime())) {
          validateAndSetDate(isoDate, date);
        }
      }
    }
  };

  // Validate date against min/max and call onChange
  const validateAndSetDate = (isoDate, dateObj) => {
    let isValid = true;

    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      dateObj.setHours(0, 0, 0, 0);
      if (dateObj < min) isValid = false;
    }

    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(23, 59, 59, 999);
      if (dateObj > max) isValid = false;
    }

    if (isValid) {
      setCurrentMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
      setIsOpen(false);
      onChange({
        target: {
          name,
          value: isoDate,
        },
      });
    }
  };

  // Handle calendar day click
  const handleDayClick = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const isoDate = date.toISOString().split("T")[0];
    validateAndSetDate(isoDate, date);
  };

  // Get calendar days
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Check if day is disabled
  const isDayDisabled = (day) => {
    if (!day) return true;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    date.setHours(0, 0, 0, 0);

    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (date < min) return true;
    }

    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(23, 59, 59, 999);
      if (date > max) return true;
    }

    return false;
  };

  // Check if day is selected
  const isSelected = (day) => {
    if (!day || !value) return false;
    const [year, month, dayStr] = value.split("-");
    return (
      parseInt(dayStr) === day &&
      parseInt(month) === currentMonth.getMonth() + 1 &&
      parseInt(year) === currentMonth.getFullYear()
    );
  };

  // Is today
  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          name={name}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full bg-brand-dark border ${
            error ? "border-red-500" : "border-brand-border"
          } rounded-xl p-4 pl-12 text-white focus:border-brand-orange transition-all outline-none font-bold placeholder:text-brand-text-muted/50 ${className}`}
          maxLength="10"
        />
        <Calendar
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted opacity-50 pointer-events-none"
        />
      </div>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full md:w-96 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-50 p-4 animate-fade-in">
          {/* Header with month/year navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1,
                  ),
                )
              }
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} className="text-brand-text-secondary" />
            </button>

            <div className="text-center">
              <h3 className="text-sm font-bold text-white">
                {currentMonth.toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1,
                  ),
                )
              }
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={18} className="text-brand-text-secondary" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-brand-text-muted"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  day && !isDayDisabled(day) && handleDayClick(day)
                }
                disabled={isDayDisabled(day)}
                className={`p-2 text-xs font-bold rounded-lg transition-all ${
                  !day
                    ? "text-transparent"
                    : isDayDisabled(day)
                      ? "text-brand-text-muted/30 cursor-not-allowed"
                      : isSelected(day)
                        ? "bg-brand-orange text-white shadow-glow"
                        : isToday(day)
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                          : "text-brand-text-secondary hover:bg-white/10"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Today button */}
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const isoDate = today.toISOString().split("T")[0];
              validateAndSetDate(isoDate, today);
            }}
            className="w-full mt-4 py-2 text-xs font-bold text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-colors uppercase tracking-widest"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
