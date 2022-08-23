const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full font-sans bg-primaryBlue dark:bg-baseBlue text-neutral-900 transition duration-200  ">
      <div className="flex flex-col flex-1">
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Layout;
