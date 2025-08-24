import React from 'react';
import { themeIcons } from 'seti-icons';
import '../icons.css';
import { cn } from '../utils/cn';

interface FileIconProps {
  fileName: string;
  size?: number | string;
  className?: string;
  title?: string;
}

const palette = {
  blue: '#268bd2',
  grey: '#657b83',
  'grey-light': '#839496',
  green: '#859900',
  orange: '#cb4b16',
  pink: '#d33682',
  purple: '#6c71c4',
  red: '#dc322f',
  white: '#839496',
  yellow: '#b58900',
  ignore: '#586e75',
};

const getIcon = themeIcons(palette);

const _FileIcon: React.FC<FileIconProps> = ({
  fileName,
  size = 20,
  className,
  title,
}) => {
  const { svg, color } = getIcon(fileName);

  const dim = typeof size === 'number' ? `${size}px` : size;

  return (
    <span
      aria-hidden={title ? undefined : true}
      role="img"
      title={title}
      className={cn('file-icon', className)}
      style={{
        width: dim,
        height: dim,
        display: 'inline-block',
        verticalAlign: 'middle',
        fill: color,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

const FileIcon = React.memo(_FileIcon);

export default FileIcon;
