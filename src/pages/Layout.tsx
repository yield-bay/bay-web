const Layout = ({ children }) => {
  return (
    <div>
      <div className="flex flex-col flex-1">
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Layout;
