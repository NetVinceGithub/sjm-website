import { FaAngleRight } from "react-icons/fa6";

const Breadcrumb = ({ items }) => {
  return (
    <nav className="-mt-3 flex flex-wrap text-gray-600 text-sm py-2" aria-label="breadcrumb">
      <ol className="list-none p-0 inline-flex flex-wrap items-center">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index !== items.length - 1 ? (
              <>
                <a href={item.href} className="text-neutralDGray no-underline hover:text-brandPrimary">
                  {item.label}
                </a>
                <span className="mx-2 text-gray-400">
                  <FaAngleRight />
                </span>
              </>
            ) : (
              <span className="text-gray-700 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
