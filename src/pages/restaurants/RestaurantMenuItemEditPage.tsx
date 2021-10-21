import { collection, collectionGroup, deleteDoc, query, setDoc, where } from '@firebase/firestore'
import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonCheckbox,
	IonContent,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonItemDivider,
	IonLabel,
	IonList,
	IonPage,
	IonRadio,
	IonRadioGroup,
	IonTextarea,
	IonTitle,
	IonToolbar,
	useIonRouter,
} from '@ionic/react'
import { doc, getDocs } from 'firebase/firestore'
import { addOutline, checkmarkOutline, removeOutline } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { RestaurantItemIngredientModel, RestaurantItemModel, RestaurantItemOptionModel, RestaurantModel } from '../../data/restaurants/Restaurant'
import { firestore } from '../../Firebase'
import { useGetRestaurant } from '../../util/hooks'
import { capitalize, decodeB64Url } from '../../util/misc'
import LoadingPage from '../LoadingPage'

type RestaurantMenuItemEditPageProps = {
	restaurants: RestaurantModel[]
}

const RestaurantMenuItemEditPage: React.FC<RestaurantMenuItemEditPageProps> = ({ restaurants }) => {
	const { restaurantItemB64 } = useParams<{ restaurantItemB64: string }>()
	const [restaurant, _] = useGetRestaurant(restaurants)
	const router = useIonRouter()
	const addOrEdit: 'add' | 'edit' = restaurantItemB64 === 'add' ? 'add' : 'edit'
	const [restaurantItem, setRestaurantItem] = useState(
		addOrEdit === 'add'
			? ({
					name: '',
					category: '',
					ingredients: [],
					selectedIngredients: [],
					options: [],
					minutesToReady: 20,
					price: 5,
					restaurantUid: restaurant?.uid,
					uid: '',
			  } as RestaurantItemModel)
			: decodeB64Url<RestaurantItemModel>(restaurantItemB64)
	)

	useEffect(() => {
		if (restaurant?.uid) setRestaurantItem({ ...restaurantItem, restaurantUid: restaurant.uid })
	}, [restaurant?.uid])

	if (!restaurant) return <LoadingPage />

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonBackButton defaultHref={`/restaurants/${restaurant.uid}/menu`} />
					</IonButtons>
					<IonTitle>{`${capitalize(addOrEdit)}: ${restaurantItem.name}`}</IonTitle>
					<IonButtons slot='end'>
						<IonButton
							disabled={!(restaurantItem.name && restaurantItem.category && restaurantItem.ingredients.every((ing) => !!ing.name))}
							onClick={async () => {
								setRestaurantItem({
									...restaurantItem,
									ingredients: restaurantItem.ingredients.filter((ing) => !!ing.name),
									options: restaurantItem.options.filter((opt) => !!opt.name),
								})
								if (addOrEdit === 'edit') {
									const oldItem = decodeB64Url<RestaurantItemModel>(restaurantItemB64)
									//Update restaurant item of old item name
									const restaurantItemToUpdate = doc(firestore, 'restaurants', restaurant.uid, 'items', restaurantItem.uid)
									//Update all favorite items of old item name
									const favoriteItemsToUpdate = (
										await getDocs(query(collectionGroup(firestore, 'favorites'), where('uid', '==', oldItem.uid)))
									).docs
									//Remove all user bag items of old item name
									const bagItemsToDelete = (
										await getDocs(query(collectionGroup(firestore, 'bag'), where('restaurantItem.uid', '==', oldItem.uid)))
									).docs
									//Update restaurantItems + favoriteItems
									await Promise.all(
										favoriteItemsToUpdate
											.map((doc) => doc.ref)
											.concat(restaurantItemToUpdate)
											.map((docRef) => setDoc(docRef, restaurantItem))
									)
									console.log('Updated restaurant item of name ' + oldItem.name, restaurantItemToUpdate)
									console.log(
										'Updated favorite items of name ' + oldItem.name,
										favoriteItemsToUpdate.map((doc) => doc.data())
									)
									//Delete the user bag items
									await Promise.all(bagItemsToDelete.map((doc) => deleteDoc(doc.ref)))
									console.log(
										'Deleted bag items of name ' + oldItem.name,
										bagItemsToDelete.map((doc) => doc.data())
									)
								} else {
									const newDoc = doc(collection(firestore, 'restaurants', restaurant.uid, 'items'))
									await setDoc(newDoc, { ...restaurantItem, uid: newDoc.id } as RestaurantItemModel)
									console.log('Added item to firestore', restaurantItem)
								}
								router.goBack()
							}}
						>
							<IonIcon slot='icon-only' icon={checkmarkOutline} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					<IonItemDivider>Name:</IonItemDivider>
					<IonItem>
						<IonInput
							placeholder='Name'
							value={restaurantItem.name}
							onIonChange={(e) => setRestaurantItem({ ...restaurantItem, name: e.detail.value ?? '' })}
						/>
					</IonItem>
					<IonItemDivider>Description:</IonItemDivider>
					<IonItem>
						<IonTextarea
							autoGrow
							placeholder='Description'
							value={restaurantItem.description}
							onIonChange={(e) => setRestaurantItem({ ...restaurantItem, description: e.detail.value ?? '' })}
						/>
					</IonItem>
					<IonItemDivider>Category:</IonItemDivider>
					<IonItem>
						<IonInput
							placeholder='Category'
							value={restaurantItem.category}
							onIonChange={(e) => setRestaurantItem({ ...restaurantItem, category: e.detail.value ?? '' })}
						/>
					</IonItem>
					<IonItemDivider>Price:</IonItemDivider>
					<IonItem>
						<IonLabel>$</IonLabel>
						<IonInput
							placeholder='Price'
							value={restaurantItem.price}
							type='number'
							min='0'
							onIonChange={(e) => {
								const price = parseFloat(e.detail.value ?? '0')
								setRestaurantItem({
									...restaurantItem,
									price: price === NaN || price < 0 ? 0 : price,
								})
							}}
						/>
					</IonItem>
					<IonItemDivider>Approximate Minutes to Ready:</IonItemDivider>
					<IonItem>
						<IonInput
							placeholder='Minutes to Ready'
							value={restaurantItem.minutesToReady}
							type='number'
							min='0'
							onIonChange={(e) => {
								const mins = parseFloat(e.detail.value ?? '0')
								setRestaurantItem({
									...restaurantItem,
									minutesToReady: mins === NaN || mins < 0 ? 0 : mins,
								})
							}}
						/>
					</IonItem>
					<IonItemDivider>Ingredients:</IonItemDivider>
					{restaurantItem.ingredients.concat({ name: '' } as RestaurantItemIngredientModel).map((ingredient, i) => {
						const isNewIngredient = i === restaurantItem.ingredients.length
						return (
							<IonItem key={i}>
								{!isNewIngredient && (
									<IonCheckbox
										checked={restaurantItem.selectedIngredients.includes(i)}
										onClick={() =>
											setRestaurantItem({
												...restaurantItem,
												selectedIngredients: restaurantItem.selectedIngredients.includes(i)
													? restaurantItem.selectedIngredients.filter((ingIndex) => ingIndex !== i)
													: restaurantItem.selectedIngredients.concat(i),
											})
										}
									/>
								)}
								<IonInput
									placeholder={`${isNewIngredient ? 'New ' : ''}Ingredient Name`}
									value={ingredient.name}
									onIonChange={(e) => {
										if (!ingredient.name && !e.detail.value) return
										const newIngredient = { ...ingredient, name: e.detail.value ?? '' }
										if (isNewIngredient) {
											restaurantItem.ingredients = restaurantItem.ingredients.concat(newIngredient)
											setRestaurantItem({ ...restaurantItem })
											return
										}
										if (!e.detail.value) {
											setRestaurantItem({ ...restaurantItem, ingredients: restaurantItem.ingredients.removeIndex(i) })
											return
										}
										restaurantItem.ingredients[i] = newIngredient
										setRestaurantItem({ ...restaurantItem })
									}}
								/>
								{!isNewIngredient && (
									<>
										<IonLabel>$</IonLabel>
										<div style={{ float: 'right', width: '50px' }}>
											<IonInput
												placeholder='0'
												type='number'
												slot='end'
												min='0'
												value={ingredient.price ?? 0}
												onIonChange={(e) => {
													const price = parseFloat(e.detail.value ?? '0')
													if (!ingredient.price && !price) return
													const newIngredient = {
														...ingredient,
														price: price === NaN || price < 0 ? 0 : price,
													}
													if (isNewIngredient) {
														setRestaurantItem({ ...restaurantItem, ingredients: restaurantItem.ingredients.concat(newIngredient) })
														return
													}
													restaurantItem.ingredients[i] = newIngredient
													setRestaurantItem({ ...restaurantItem })
												}}
											/>
										</div>
										<IonButtons slot='end'>
											<IonButton
												onClick={() => setRestaurantItem({ ...restaurantItem, ingredients: restaurantItem.ingredients.removeIndex(i) })}
											>
												<IonIcon slot='icon-only' icon={isNewIngredient ? addOutline : removeOutline} />
											</IonButton>
										</IonButtons>
									</>
								)}
							</IonItem>
						)
					})}
					<IonItemDivider>Options</IonItemDivider>
					{restaurantItem.options.concat({ name: '', selectable: [], selected: -1 } as RestaurantItemOptionModel).map((option, i) => {
						const isNewOption = i === restaurantItem.options.length
						return (
							<React.Fragment key={i}>
								<IonItem>
									<IonInput
										value={option.name}
										placeholder={`${isNewOption ? 'New ' : ''}Option Name`}
										onIonChange={(e) => {
											if (!option.name && !e.detail.value) return
											const newOption = { ...option, name: e.detail.value ?? '' }
											if (isNewOption) {
												setRestaurantItem({ ...restaurantItem, options: restaurantItem.options.concat(newOption) })
												return
											}
											if (!e.detail.value) {
												restaurantItem.options = restaurantItem.options.removeIndex(i)
												setRestaurantItem({ ...restaurantItem })
												return
											}
											restaurantItem.options[i] = newOption
											setRestaurantItem({ ...restaurantItem })
										}}
									/>
									{!isNewOption && (
										<IonButtons slot='end'>
											<IonButton onClick={() => setRestaurantItem({ ...restaurantItem, options: restaurantItem.options.removeIndex(i) })}>
												<IonIcon slot='icon-only' icon={removeOutline} />
											</IonButton>
										</IonButtons>
									)}
								</IonItem>
								{!isNewOption && (
									<IonList style={{ width: '100%', paddingLeft: 10 }}>
										<IonRadioGroup value={option.selected}>
											{option.selectable.concat({ name: '', price: 0 }).map((select, j) => {
												const isNewSelect = j === option.selectable.length
												return (
													<IonItem key={j}>
														{!isNewSelect && (
															<IonRadio
																onClick={() => {
																	if (option.selected === j) option.selected = -1
																	else option.selected = j
																	setRestaurantItem({ ...restaurantItem })
																}}
																slot='start'
																value={j}
															/>
														)}
														<IonInput
															placeholder={`${isNewSelect ? 'New ' : ''}Selectable Item for ${option.name}`}
															value={select.name}
															onIonChange={(e) => {
																if (!select.name && !e.detail.value) return
																const newSelect = { ...select, name: e.detail.value ?? '' }
																if (isNewSelect) {
																	option.selectable = option.selectable.concat(newSelect)
																	setRestaurantItem({ ...restaurantItem })
																	return
																}
																if (!e.detail.value) {
																	option.selectable = option.selectable.removeIndex(j)
																	setRestaurantItem({ ...restaurantItem })
																	return
																}
																option.selectable[j] = newSelect
																setRestaurantItem({ ...restaurantItem })
															}}
														/>
														{!isNewSelect && (
															<>
																<IonLabel>$</IonLabel>
																<div style={{ float: 'right', width: '50px' }}>
																	<IonInput
																		placeholder='0'
																		type='number'
																		slot='end'
																		min='0'
																		value={select.price ?? 0}
																		onIonChange={(e) => {
																			const price = parseFloat(e.detail.value ?? '0')
																			if (!select.price && !price) return
																			const newSelect = {
																				...select,
																				price: price === NaN || price < 0 ? 0 : price,
																			}
																			if (isNewSelect) {
																				restaurantItem.options[i].selectable =
																					restaurantItem.options[i].selectable.concat(newSelect)
																				setRestaurantItem({ ...restaurantItem })
																				return
																			}
																			restaurantItem.options[i].selectable[j] = newSelect
																			setRestaurantItem({ ...restaurantItem })
																		}}
																	/>
																</div>
																<IonButtons slot='end'>
																	<IonButton
																		onClick={() => {
																			option.selectable = option.selectable.removeIndex(j)
																			setRestaurantItem({ ...restaurantItem })
																		}}
																	>
																		<IonIcon slot='icon-only' icon={removeOutline} />
																	</IonButton>
																</IonButtons>
															</>
														)}
													</IonItem>
												)
											})}
										</IonRadioGroup>
									</IonList>
								)}
							</React.Fragment>
						)
					})}
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default RestaurantMenuItemEditPage
