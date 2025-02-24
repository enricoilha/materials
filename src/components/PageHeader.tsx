interface PageHeaderProps {
  title: string;
  description: string;
}
export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
        {title}
      </h1>
      <p className="max-w-2xl text-lg font-light text-foreground mt-1">
        {description}
      </p>
    </div>
  );
};
