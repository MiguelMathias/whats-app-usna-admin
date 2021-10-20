import { IonIcon, IonItem, IonTitle } from '@ionic/react'
import { chevronDownOutline, chevronForwardOutline } from 'ionicons/icons'
import React, { PropsWithChildren, useState } from 'react'

interface AccordionIonItemProps extends PropsWithChildren<{}> {
	header: string
	icon?: string
	initiallyOpen?: boolean
	className?: string
}

const AccordionIonItem: React.FC<AccordionIonItemProps> = ({ header, icon, initiallyOpen, className, children }) => {
	const [showItem, setShowItem] = useState(initiallyOpen)

	return (
		<>
			<IonItem button onClick={() => setShowItem(!showItem)}>
				<IonIcon icon={showItem ? chevronDownOutline : chevronForwardOutline} />
				<IonTitle>{header}</IonTitle>
				<IonIcon slot='end' icon={icon} />
			</IonItem>
			<div className={className}>{showItem ? children : <></>}</div>
		</>
	)
}

export default AccordionIonItem
