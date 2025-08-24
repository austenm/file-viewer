import { cn } from '../utils/cn';
import ChevronIcon from './ChevronIcon';
import FileIcon from './FileIcon';

type BreadcrumbProps = {
  path: string;
};

const Breadcrumbs = ({ path }: BreadcrumbProps) => {
  const parts = path.split('/');
  let acc = '';
  const crumbs = parts.map((seg) => {
    acc = acc ? `${acc}/${seg}` : seg;
    return { seg, sub: acc };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-[#1e1e1e] text-neutral-400 text-[0.8rem]"
    >
      <ol className="scrollbar flex items-center gap-0.5 px-4 py-0.5 overflow-x-auto overflow-y-hidden scrollbar whitespace-nowrap min-w-0">
        {crumbs.map(({ seg, sub }, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={sub} className="flex items-center min-w-0">
              {i > 0 && <ChevronIcon className="mx-1" />}
              {isLast && <FileIcon fileName={path} />}
              <span
                aria-current={isLast ? 'page' : undefined}
                className={cn(
                  'truncate max-w-[12rem]',
                  isLast && 'text-neutral-300',
                )}
                title={seg}
              >
                {seg}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
