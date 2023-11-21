import React from "react";

const Cell = ({
  value,
  onSelect,
  initialCellValue,
  isSelected,
  backgroundColor,
  isError,
}) => {
  const selectedClass = isSelected ? "cell--selected" : "";
  const editableClass =
    initialCellValue !== 0 ? "cell--non-editable" : "cell--editable";
  const emptyClass = value == 0 ? "cell--empty" : "";
  const errorClass = isError ? "cell--error" : "";
  const cellClass = `cell ${selectedClass} ${editableClass} ${emptyClass} ${errorClass}`;

  const style = backgroundColor ? { backgroundColor } : {};

  const handleClick = () => {
    onSelect(value, initialCellValue);
  };

  return (
    <div className={cellClass} style={style} onClick={handleClick}>
      {value !== 0 ? value : ""}
    </div>
  );
};

export default Cell;
