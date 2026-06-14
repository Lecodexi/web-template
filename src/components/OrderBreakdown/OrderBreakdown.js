/**
 * This component will show the booking info and calculated total price.
 * I.e. dates and other details related to payment decision in receipt format.
 */
import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import {
  DATE_TYPE_DATE,
  DATE_TYPE_DATETIME,
  DATE_TYPE_TIME,
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_FIXED,
  LINE_ITEM_HOUR,
  LINE_ITEM_PROVIDER_COMMISSION,
  LISTING_UNIT_TYPES,
  propTypes,
} from '../../util/types';

import LineItemBookingPeriod from './LineItemBookingPeriod';
import LineItemBasePriceMaybe from './LineItemBasePriceMaybe';
import LineItemSubTotalMaybe from './LineItemSubTotalMaybe';
import LineItemShippingFeeMaybe from './LineItemShippingFeeMaybe';
import LineItemPickupFeeMaybe from './LineItemPickupFeeMaybe';
import LineItemCustomerCommissionMaybe from './LineItemCustomerCommissionMaybe';
import LineItemCustomerCommissionRefundMaybe from './LineItemCustomerCommissionRefundMaybe';
import LineItemProviderCommissionMaybe from './LineItemProviderCommissionMaybe';
import LineItemProviderCommissionRefundMaybe from './LineItemProviderCommissionRefundMaybe';
import LineItemRefundMaybe from './LineItemRefundMaybe';
import LineItemTotalPrice from './LineItemTotalPrice';
import LineItemUnknownItemsMaybe from './LineItemUnknownItemsMaybe';

import css from './OrderBreakdown.module.css';

export const OrderBreakdownComponent = props => {
  const {
    rootClassName,
    className,
    userRole,
    transaction,
    booking,
    timeZone,
    currency,
    marketplaceName,
    intl,
  } = props;

  const isCustomer = userRole === 'customer';
  const isProvider = userRole === 'provider';
  const allLineItems = transaction.attributes.lineItems || [];
  // We'll show only line-items that are specific for the current userRole (customer vs provider)
  const lineItems = allLineItems.filter(lineItem => lineItem.includeFor.includes(userRole));
  const unitLineItem = lineItems.find(
    item => LISTING_UNIT_TYPES.includes(item.code) && !item.reversal
  );
  // Line-item code that matches with base unit: day, night, hour, fixed, item
  const lineItemUnitType = unitLineItem?.code;
  const dateType = [LINE_ITEM_HOUR, LINE_ITEM_FIXED].includes(lineItemUnitType)
    ? DATE_TYPE_DATETIME
    : DATE_TYPE_DATE;

  const hasCommissionLineItem = lineItems.find(item => {
    const hasCustomerCommission = isCustomer && item.code === LINE_ITEM_CUSTOMER_COMMISSION;
    const hasProviderCommission = isProvider && item.code === LINE_ITEM_PROVIDER_COMMISSION;
    return (hasCustomerCommission || hasProviderCommission) && !item.reversal;
  });

  // --- RÉCUPÉRATION DE LA CAUTION DYNAMIQUE ---
  const publicData = transaction?.listing?.attributes?.publicData || {};
  const securityDepositObj = publicData?.securityDeposit;
  // Sharetribe stocke les prix en centimes (ex: 3000 pour 30,00€), on divise donc par 100
  const cautionAmount = securityDepositObj?.amount ? securityDepositObj.amount / 100 : 0;
  // ---------------------------------------------

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <LineItemBookingPeriod
        booking={booking}
        code={lineItemUnitType}
        dateType={dateType}
        timeZone={timeZone}
      />

      <LineItemBasePriceMaybe lineItems={lineItems} code={lineItemUnitType} intl={intl} />
      <LineItemShippingFeeMaybe lineItems={lineItems} intl={intl} />
      <LineItemPickupFeeMaybe lineItems={lineItems} intl={intl} />
      <LineItemUnknownItemsMaybe lineItems={lineItems} isProvider={isProvider} intl={intl} />

      <LineItemSubTotalMaybe
        lineItems={lineItems}
        code={lineItemUnitType}
        userRole={userRole}
        intl={intl}
        marketplaceCurrency={currency}
      />
      <LineItemRefundMaybe lineItems={lineItems} intl={intl} marketplaceCurrency={currency} />

      <LineItemCustomerCommissionMaybe
        lineItems={lineItems}
        isCustomer={isCustomer}
        marketplaceName={marketplaceName}
        intl={intl}
      />
      <LineItemCustomerCommissionRefundMaybe
        lineItems={lineItems}
        isCustomer={isCustomer}
        marketplaceName={marketplaceName}
        intl={intl}
      />

      <LineItemProviderCommissionMaybe
        lineItems={lineItems}
        isProvider={isProvider}
        marketplaceName={marketplaceName}
        intl={intl}
      />
      <LineItemProviderCommissionRefundMaybe
        lineItems={lineItems}
        isProvider={isProvider}
        marketplaceName={marketplaceName}
        intl={intl}
      />

      {/* --- DÉBUT DE LA LIGNE CAUTION DYNAMIQUE --- */}
      {cautionAmount > 0 ? (
        <div style={{ padding: '16px 0 8px 0', borderTop: '1px solid #EAEAEA', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span>
              <strong style={{ color: '#4A4A4A', fontSize: '16px' }}>Caution du matériel</strong>
            </span>
            <span style={{ fontWeight: 'bold', color: '#4A4A4A', fontSize: '16px' }}>{cautionAmount.toFixed(2)} €</span>
          </div>
          
          {/* Ce texte rassurant ne s'affiche que pour le locataire au moment de payer */}
          {isCustomer ? (
            <div style={{ backgroundColor: '#F0F8FF', border: '1px solid #B0D4FF', padding: '12px', borderRadius: '6px', fontSize: '13px', color: '#004085', lineHeight: '1.5' }}>
              <strong>Information importante :</strong> Ce montant de {cautionAmount.toFixed(2)} € n'est <strong>pas débité</strong> de votre compte aujourd'hui. Il s'agit uniquement d'une empreinte bancaire sécurisée agissant comme garantie en cas de perte ou de dégradation du jeu.
            </div>
          ) : null}
        </div>
      ) : null}
      {/* --- FIN DE LA LIGNE CAUTION DYNAMIQUE --- */}

      <LineItemTotalPrice transaction={transaction} isProvider={isProvider} intl={intl} />

      {hasCommissionLineItem ? (
        <span className={css.feeInfo}>
          <FormattedMessage id="OrderBreakdown.commissionFeeNote" />
        </span>
      ) : null}
    </div>
  );
};

const OrderBreakdown = props => {
  const intl = useIntl();
  return <OrderBreakdownComponent intl={intl} {...props} />;
};

export default OrderBreakdown;