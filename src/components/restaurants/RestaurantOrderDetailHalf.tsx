import { doc, serverTimestamp, setDoc } from '@firebase/firestore'
import {
	IonButton,
	IonButtons,
	IonCheckbox,
	IonContent,
	IonHeader,
	IonIcon,
	IonItem,
	IonItemDivider,
	IonLabel,
	IonList,
	IonPage,
	IonRadio,
	IonRadioGroup,
	IonTitle,
	IonToolbar,
} from '@ionic/react'
import { checkmarkOutline } from 'ionicons/icons'
import { useState } from 'react'
import { orderTotalPrice, restaurantBagItemPrice, RestaurantOrderModel } from '../../data/restaurants/Restaurant'
import { firestore } from '../../Firebase'
import { formatDateDefault } from '../../util/misc'
import AccordionIonItem from '../AccordionIonItem'

type RestaurantOrderDetailHalfProps = {
	selectedOrderIndex: number
	order: RestaurantOrderModel
	acceptOrReject?: string
}

const RestaurantOrderDetailHalf: React.FC<RestaurantOrderDetailHalfProps> = ({ selectedOrderIndex, order }) => {
	const [acceptOrReject, setAcceptOrReject] = useState<string>()
	const [fulfilled, setFulfilled] = useState<boolean>(false)

	return (
		<div className='ordersView'>
			{selectedOrderIndex >= 0 && (
				<IonPage>
					<IonHeader>
						<IonToolbar>
							<IonTitle slot='start'>Order: ${orderTotalPrice(order)}</IonTitle>
							<IonButtons slot='end'>
								<IonButton
									onClick={async () => {
										let updatedOrder = { ...order }
										if (acceptOrReject === 'accepted' && !order.accepted)
											updatedOrder = {
												...updatedOrder,
												accepted: serverTimestamp() as any,
											}
										else if (acceptOrReject === 'rejected' && !order.rejected)
											updatedOrder = {
												...updatedOrder,
												rejected: serverTimestamp() as any,
											}
										else if (order.accepted && !order.fulfilled && fulfilled)
											updatedOrder = {
												...updatedOrder,
												fulfilled: serverTimestamp() as any,
											}
										setDoc(
											doc(firestore, 'users', order.userUid, 'orders', order.uid),
											updatedOrder
										)
									}}
								>
									<IonIcon slot='icon-only' icon={checkmarkOutline} />
								</IonButton>
							</IonButtons>
						</IonToolbar>
					</IonHeader>
					<IonContent>
						<IonList>
							<IonItem>
								<IonLabel>Submitted</IonLabel>
								<IonLabel slot='end'>{formatDateDefault(order.submitted?.toDate())}</IonLabel>
							</IonItem>
							<IonRadioGroup
								value={acceptOrReject}
								onIonChange={(e) => setAcceptOrReject(e.detail.value)}
							>
								{!order.rejected && (
									<IonItem>
										<IonLabel>
											Accept
											{order.accepted && 'ed'}
										</IonLabel>
										{!order.accepted && !order.rejected ? (
											<IonRadio slot='end' value='accepted' />
										) : (
											<IonLabel slot='end'>
												{formatDateDefault(order.accepted?.toDate())}
											</IonLabel>
										)}
									</IonItem>
								)}
								{!order.accepted && (
									<IonItem>
										<IonLabel>
											Reject
											{order.rejected && 'ed'}
										</IonLabel>
										{!order.accepted && !order.rejected ? (
											<IonRadio slot='end' value='rejected' />
										) : (
											<IonLabel slot='end'>
												{formatDateDefault(order.rejected?.toDate())}
											</IonLabel>
										)}
									</IonItem>
								)}
							</IonRadioGroup>
							{order.accepted && (
								<IonItem>
									<IonLabel>Fulfilled</IonLabel>
									{!order.fulfilled ? (
										<IonCheckbox
											slot='end'
											checked={fulfilled}
											onIonChange={() => setFulfilled(!fulfilled)}
										/>
									) : (
										<IonLabel slot='end'>{formatDateDefault(order.fulfilled?.toDate())}</IonLabel>
									)}
								</IonItem>
							)}
							<IonItemDivider>Items</IonItemDivider>
							{order.restaurantBagItems.map((restaurantBagItem, i) => (
								<AccordionIonItem
									key={i}
									initiallyOpen
									header={`${restaurantBagItem.restaurantItem.name}: $${restaurantBagItemPrice(
										restaurantBagItem
									)}`}
								>
									<IonList>
										<IonItem>
											<b>Ingredients:</b>
											<div slot='end' style={{ textAlign: 'right' }}>
												{restaurantBagItem.restaurantItem.ingredients.map((ingredient, i) => (
													<p key={i}>
														{ingredient.name}
														{ingredient.price && ` (+$${ingredient.price})`}
													</p>
												))}
											</div>
										</IonItem>
										<IonItem>
											<b>Options:</b>
											<div slot='end' style={{ textAlign: 'right' }}>
												{restaurantBagItem.restaurantItem.options
													.filter((option) => option.selected >= 0)
													.map((option, i) => (
														<p key={i}>
															<ins>{option.name}:</ins>{' '}
															{option.selectable[option.selected].name}
															{option.selectable[option.selected].price &&
																` (+$${option.selectable[option.selected].price})`}
														</p>
													))}
											</div>
										</IonItem>
										{restaurantBagItem.note && (
											<IonItem>
												<b>Note:</b>
												<p slot='end'>{restaurantBagItem.note}</p>
											</IonItem>
										)}
									</IonList>
								</AccordionIonItem>
							))}
						</IonList>
					</IonContent>
				</IonPage>
			)}
		</div>
	)
}

export default RestaurantOrderDetailHalf
