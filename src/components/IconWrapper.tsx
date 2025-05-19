import React from 'react';
import { IconType } from 'react-icons';

interface IconWrapperProps extends React.ComponentPropsWithoutRef<'svg'> {
  icon: IconType;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ icon: Icon, ...props }) => {
  return <Icon {...props} />;
};

export default IconWrapper; 