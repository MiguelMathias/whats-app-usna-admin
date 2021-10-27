import { collection, collectionGroup, deleteDoc, query, setDoc, where } from '@firebase/firestore'
import { getDownloadURL, listAll, ref, uploadBytes } from '@firebase/storage'
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
	IonReorder,
	IonReorderGroup,
	IonTextarea,
	IonTitle,
	IonToolbar,
	useIonLoading,
	useIonRouter,
} from '@ionic/react'
import { doc, getDocs } from 'firebase/firestore'
import { addOutline, checkmarkOutline, removeOutline } from 'ionicons/icons'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import {
	RestaurantItemIngredientModel,
	RestaurantItemModel,
	RestaurantItemOptionModel,
	RestaurantItemOptionSelectableModel,
	RestaurantModel,
} from '../../data/restaurants/Restaurant'
import { deleteStorageFolder, firestore, storage } from '../../Firebase'
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
					locationUids: restaurant?.locations.map((location) => location.uid) ?? [],
			  } as RestaurantItemModel)
			: decodeB64Url<RestaurantItemModel>(restaurantItemB64)
	)

	const [imgFiles, setImgFiles] = useState<File[]>([])
	const [showLoading, hideLoading] = useIonLoading()

	useEffect(() => {
		if (restaurant?.uid) {
			setRestaurantItem({ ...restaurantItem, restaurantUid: restaurant.uid })
			listAll(ref(storage, `restaurants/${restaurant.uid}/items/${restaurantItem.uid}/pictures`)).then(async (fileList) => {
				setImgFiles(
					await Promise.all(fileList.items.map(async (item) => new File([await (await fetch(await getDownloadURL(item))).blob()], item.name)))
				)
			})
		}
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
								if (addOrEdit === 'edit') {
									//Update restaurant item of old item name
									const restaurantItemToUpdate = doc(firestore, 'restaurants', restaurant.uid, 'items', restaurantItem.uid)
									//Update all favorite items of old item
									const favoriteItemsToDelete = (
										await getDocs(query(collectionGroup(firestore, 'favorites'), where('restaurantItem.uid', '==', restaurantItem.uid)))
									).docs
									//Remove all user bag items of old item name
									const bagItemsToDelete = (
										await getDocs(query(collectionGroup(firestore, 'bag'), where('restaurantItem.uid', '==', restaurantItem.uid)))
									).docs
									//Update restaurantItems
									await setDoc(restaurantItemToUpdate, restaurantItem)
									console.log('Updated restaurant item of name ' + restaurantItem.name, restaurantItemToUpdate)

									//Delete the user bag and favorite items
									await Promise.all(bagItemsToDelete.concat(favoriteItemsToDelete).map((doc) => deleteDoc(doc.ref)))
									console.log(
										'Deleted favorite items of name ' + restaurantItem.name,
										favoriteItemsToDelete.map((doc) => doc.data())
									)
									console.log(
										'Deleted bag items of name ' + restaurantItem.name,
										bagItemsToDelete.map((doc) => doc.data())
									)

									//update images in firebase storage
									await deleteStorageFolder(storage, `restaurants/${restaurant.uid}/items/${restaurantItem.uid}/pictures`)
									await Promise.all(
										imgFiles.map(async (imgFile, i) => {
											const imgLocRef = ref(
												storage,
												`restaurants/${restaurant.uid}/items/${restaurantItem.uid}/pictures/${restaurantItem.uid}-${i}`
											)
											await uploadBytes(imgLocRef, imgFile)
										})
									)
								} else {
									const newDoc = doc(collection(firestore, 'restaurants', restaurant.uid, 'items'))
									await setDoc(newDoc, { ...restaurantItem, uid: newDoc.id } as RestaurantItemModel)
									console.log('Added item to firestore', restaurantItem)
									//Add images to firebase storage
									await Promise.all(
										imgFiles.map(async (imgFile, i) => {
											const imgLocRef = ref(storage, `restaurants/${restaurant.uid}/items/${newDoc.id}/pictures/${newDoc.id}-${i}`)
											await uploadBytes(imgLocRef, imgFile)
										})
									)
								}

								router.push(`/restaurants/${restaurant.uid}/menu`, 'back', 'pop')
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
					{restaurant.locations.length > 0 && (
						<>
							<IonItemDivider>Locations</IonItemDivider>
							{restaurant.locations.map((location, i) => {
								return (
									<IonItem key={i}>
										<IonCheckbox
											slot='start'
											checked={restaurantItem.locationUids.includes(location.uid)}
											onClick={() =>
												setRestaurantItem({
													...restaurantItem,
													locationUids: restaurantItem.locationUids.includes(location.uid)
														? restaurantItem.locationUids.filter((locationUid) => locationUid !== location.uid)
														: restaurantItem.locationUids.concat(location.uid),
												})
											}
										/>
										<IonLabel>{location.name}</IonLabel>
									</IonItem>
								)
							})}
						</>
					)}
					<IonItemDivider>Ingredients:</IonItemDivider>
					<IonReorderGroup
						disabled={false}
						onIonItemReorder={(e) => {
							restaurantItem.ingredients.splice(e.detail.to, 0, restaurantItem.ingredients.splice(e.detail.from, 1)[0])
							setRestaurantItem((restaurantItem) => restaurantItem)
							e.detail.complete()
						}}
					>
						{restaurantItem.ingredients.concat({ name: '', price: 0, selected: false } as RestaurantItemIngredientModel).map((ingredient, i) => {
							const isNewIngredient = i === restaurantItem.ingredients.length
							return (
								<IonItem key={i}>
									{!isNewIngredient && (
										<IonCheckbox
											slot='start'
											checked={ingredient.selected}
											onIonChange={(e) => {
												ingredient.selected = e.detail.checked
												setRestaurantItem((restaurantItem) => ({
													...restaurantItem,
												}))
											}}
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
												setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
												return
											}
											if (!e.detail.value) {
												setRestaurantItem({ ...restaurantItem, ingredients: restaurantItem.ingredients.removeIndex(i) })
												return
											}
											restaurantItem.ingredients[i] = newIngredient
											setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
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
															setRestaurantItem({
																...restaurantItem,
																ingredients: restaurantItem.ingredients.concat(newIngredient),
															})
															return
														}
														restaurantItem.ingredients[i] = newIngredient
														setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
													}}
												/>
											</div>
											<IonButtons slot='end'>
												<IonButton
													onClick={() =>
														setRestaurantItem({ ...restaurantItem, ingredients: restaurantItem.ingredients.removeIndex(i) })
													}
												>
													<IonIcon slot='icon-only' icon={isNewIngredient ? addOutline : removeOutline} />
												</IonButton>
											</IonButtons>
											<IonReorder slot='end' />
										</>
									)}
								</IonItem>
							)
						})}
					</IonReorderGroup>
					<IonItemDivider>Options</IonItemDivider>
					<IonReorderGroup
						disabled={false}
						onIonItemReorder={(e) => {
							restaurantItem.options.splice(e.detail.to, 0, restaurantItem.options.splice(e.detail.from, 1)[0])
							setRestaurantItem((restaurantItem) => restaurantItem)
							e.detail.complete()
						}}
					>
						{restaurantItem.options.concat({ name: '', selectable: [], selected: -1 } as RestaurantItemOptionModel).map((option, i) => {
							const isNewOption = i === restaurantItem.options.length
							return (
								<React.Fragment key={i}>
									<IonItem>
										<div style={{ width: '100%' }}>
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
															setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
															return
														}
														restaurantItem.options[i] = newOption
														setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
													}}
												/>
												{!isNewOption && (
													<>
														<IonButtons slot='end'>
															<IonButton
																onClick={() =>
																	setRestaurantItem({ ...restaurantItem, options: restaurantItem.options.removeIndex(i) })
																}
															>
																<IonIcon slot='icon-only' icon={removeOutline} />
															</IonButton>
														</IonButtons>
														<IonReorder slot='end' />
													</>
												)}
											</IonItem>

											{!isNewOption && (
												<div style={{ width: '100%' }}>
													<IonList style={{ width: '100%', paddingLeft: 10 }}>
														<IonRadioGroup value={option.selectable.findIndex((select) => select.selected)}>
															<IonReorderGroup
																disabled={false}
																onIonItemReorder={(e) => {
																	e.stopPropagation()
																	option.selectable.splice(e.detail.to, 0, option.selectable.splice(e.detail.from, 1)[0])
																	setRestaurantItem((restaurantItem) => restaurantItem)
																	e.detail.complete()
																}}
															>
																{option.selectable.concat({ name: '', price: 0, selected: false }).map((select, j) => {
																	const isNewSelect = j === option.selectable.length
																	return (
																		<IonItem key={j}>
																			{!isNewSelect && (
																				<IonRadio
																					onClick={() => {
																						if (option.selectable[j].selected)
																							option.selectable = option.selectable.map(
																								(select) =>
																									({
																										...select,
																										selected: false,
																									} as RestaurantItemOptionSelectableModel)
																							)
																						else
																							option.selectable = option.selectable.map(
																								(select, k) =>
																									(k === j
																										? { ...select, selected: true }
																										: {
																												...select,
																												selected: false,
																										  }) as RestaurantItemOptionSelectableModel
																							)
																						setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
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
																						setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
																						return
																					}
																					if (!e.detail.value) {
																						option.selectable = option.selectable.removeIndex(j)
																						setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
																						return
																					}
																					option.selectable[j] = newSelect
																					setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
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
																									setRestaurantItem((restaurantItem) => ({
																										...restaurantItem,
																									}))
																									return
																								}
																								restaurantItem.options[i].selectable[j] = newSelect
																								setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
																							}}
																						/>
																					</div>
																					<IonButtons slot='end'>
																						<IonButton
																							onClick={() => {
																								option.selectable = option.selectable.removeIndex(j)
																								setRestaurantItem((restaurantItem) => ({ ...restaurantItem }))
																							}}
																						>
																							<IonIcon slot='icon-only' icon={removeOutline} />
																						</IonButton>
																					</IonButtons>
																					<IonReorder slot='end' />
																				</>
																			)}
																		</IonItem>
																	)
																})}
															</IonReorderGroup>
														</IonRadioGroup>
													</IonList>
												</div>
											)}
										</div>
									</IonItem>
								</React.Fragment>
							)
						})}
					</IonReorderGroup>
					<IonItemDivider>Images</IonItemDivider>
					<IonItem>
						<input
							type='file'
							accept='.jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*'
							multiple
							onChange={(e) => setImgFiles(Array.from(e.target.files ?? []))}
						/>
						<IonButton slot='end' onClick={() => setImgFiles([])}>
							Clear
						</IonButton>
					</IonItem>
					{imgFiles.length > 0 && (
						<IonReorderGroup
							disabled={false}
							onIonItemReorder={(e) => {
								imgFiles.splice(e.detail.to, 0, imgFiles.splice(e.detail.from, 1)[0])
								setImgFiles(imgFiles)
								e.detail.complete()
							}}
						>
							{[...Array.from(imgFiles)].map((imgFile, i) => (
								<IonItem key={i}>
									<img style={{ maxWidth: 250 }} src={URL.createObjectURL(imgFile)} />
									<IonButtons slot='end'>
										<IonButton onClick={() => setImgFiles(imgFiles.removeIndex(i))}>
											<IonIcon slot='icon-only' icon={removeOutline} />
										</IonButton>
									</IonButtons>
									<IonReorder slot='end' />
								</IonItem>
							))}
						</IonReorderGroup>
					)}
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default RestaurantMenuItemEditPage
