import { FaRegCopyright } from "react-icons/fa6";

const Copyright = () => {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center text-white bg-siteColors-purple px-8 py-4 text-sm md:text-base space-y-2 md:space-y-0 md:space-x-2 text-center">
      <div className="flex items-center space-x-2">
        <FaRegCopyright aria-label="Copyright" />
        <p>2025 Magnet Market</p>
      </div>
      <span className="hidden md:block">|</span>
      <p>Όλα τα δικαιώματα διατηρούνται</p>
    </div>
  );
};

export default Copyright