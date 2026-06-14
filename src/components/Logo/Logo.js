import React from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';

import css from './Logo.module.css';

export const LogoComponent = props => {
  const { className, layout, marketplaceName, ...rest } = props;

  const logoClasses = className || css.root;

  return (
    <div className={logoClasses} {...rest}>
      {/* Le mot "Ça" en gris foncé (Confiance/Sérieux) */}
      <span className={css.texteGris}>Ça </span>
      
      {/* Le mot "Joue !" en orange (Fun/Énergie) */}
      <span className={css.texteOrange}>Joue !</span>
    </div>
  );
};

const Logo = props => {
  const config = useConfiguration();
  const { layout = 'desktop', ...rest } = props;

  return (
    <LogoComponent
      {...rest}
      layout={layout}
      marketplaceName={config.marketplaceName}
    />
  );
};

export default Logo;