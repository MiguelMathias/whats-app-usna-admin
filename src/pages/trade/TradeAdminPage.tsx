import { IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { query, collection, orderBy, OrderByDirection, where } from 'firebase/firestore'
import { searchOutline } from 'ionicons/icons'
import React, { useState } from 'react'
import { TradeOfferModel } from '../../data/trade/Trade'
import { firestore } from '../../Firebase'
import { useSubCollection } from '../../util/hooks'

const TradeAdminPage = () => {
	const [searchText, setSearchText] = useState('')
	const [tradeOffers] = useSubCollection<TradeOfferModel>(query(collection(firestore, 'trade'), orderBy('posted', 'desc')))

	const shoudDisplay = (tradeOffer: TradeOfferModel) =>
		searchText?.length
			? tradeOffer.category.toLowerCase().startsWith(searchText.toLowerCase()) ||
			  tradeOffer.title.toLowerCase().startsWith(searchText.toLowerCase()) ||
			  tradeOffer.description.toLowerCase().includes(searchText.toLowerCase()) ||
			  tradeOffer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
			  tradeOffer.venmoId?.toLowerCase().includes(searchText.toLowerCase()) ||
			  tradeOffer.phoneNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
			  tradeOffer.roomNumber?.toLowerCase().includes(searchText.toLowerCase())
			: true

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonMenuButton slot='start' />
					<IonTitle>MidBay</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonItem color='light'>
					<IonIcon slot='start' icon={searchOutline} />
					<IonInput inputMode='search' type='search' enterkeyhint='search' onIonChange={(e) => setSearchText(e.detail.value ?? '')} />
				</IonItem>
				<IonList>
					{tradeOffers.map((tradeOffer, i) => (
						<React.Fragment key={i}>
							{shoudDisplay(tradeOffer) && (
								<IonItem button detail routerLink={`/trade/${tradeOffer.uid}`}>
									<IonLabel>
										{tradeOffer.title} - {tradeOffer.category}
									</IonLabel>
								</IonItem>
							)}
						</React.Fragment>
					))}
				</IonList>
			</IonContent>
		</IonPage>
	)
}
export default TradeAdminPage
