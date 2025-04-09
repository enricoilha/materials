interface PageHeaderProps {
  title: string;
  description: string;
}
export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] text-center ">
        {title}
      </h1>
      <p className=" text-lg font-light text-foreground mt-1 text-center  w-full">
        {description}
      </p>
    </div>
  );
};
