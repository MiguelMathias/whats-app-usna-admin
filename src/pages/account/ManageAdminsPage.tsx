import { setDoc } from '@firebase/firestore'
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { doc } from 'firebase/firestore'
import { checkmarkOutline, removeOutline } from 'ionicons/icons'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../AppContext'
import AccordionIonItem from '../../components/AccordionIonItem'
import { AdminsModel } from '../../data/account/User'
import { RestaurantModel } from '../../data/restaurants/Restaurant'
import { firestore } from '../../Firebase'

type ManageAdminsProps = {
	restaurants: RestaurantModel[]
}

const ManageAdmins: React.FC<ManageAdminsProps> = ({ restaurants }) => {
	const { admins } = useContext(AppContext)

	const [localAdmins, setLocalAdmins] = useState<AdminsModel>({ ...admins })

	useEffect(() => setLocalAdmins(admins), [JSON.stringify(admins)])

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot='start'>
						<IonMenuButton />
					</IonButtons>
					<IonTitle>Manage Administrators</IonTitle>
					<IonButtons slot='end'>
						<IonButton
							onClick={() => {
								setDoc(doc(firestore, 'admin', 'admins'), localAdmins)
							}}
						>
							<IonIcon slot='icon-only' icon={checkmarkOutline} />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonList>
					<AccordionIonItem header='All'>
						<IonList>
							{localAdmins.all.concat('').map((admin, i) => {
								const isNewAllAdmin = i === localAdmins.all.length
								return (
									<IonItem key={i}>
										<IonInput
											placeholder='Exact User UID'
											value={admin}
											onIonChange={(e) => {
												if (!admin && !e.detail.value) return
												if (isNewAllAdmin) {
													setLocalAdmins({ ...localAdmins, all: localAdmins.all.concat(e.detail.value ?? '') })
													return
												}
												if (!e.detail.value) {
													setLocalAdmins({ ...localAdmins, all: localAdmins.all.removeIndex(i) })
													return
												}
												localAdmins.all[i] = e.detail.value ?? ''
												setLocalAdmins({ ...localAdmins })
											}}
										/>
										{!isNewAllAdmin && (
											<IonButtons slot='end'>
												<IonButton onClick={() => setLocalAdmins({ ...localAdmins, all: localAdmins.all.removeIndex(i) })}>
													<IonIcon slot='icon-only' icon={removeOutline} />
												</IonButton>
											</IonButtons>
										)}
									</IonItem>
								)
							})}
						</IonList>
					</AccordionIonItem>
					{Object.keys(localAdmins.depts).map((dept, i) => {
						const deptName = restaurants.find((restaurant) => restaurant.uid === dept)?.name ?? dept.toUpperCase()
						return (
							<AccordionIonItem key={i} header={deptName}>
								<IonList>
									{localAdmins.depts[dept].concat('').map((admin, j) => {
										const isNewDeptAdmin = j === localAdmins.depts[dept].length
										return (
											<IonItem key={j}>
												<IonInput
													placeholder='Exact User UID'
													value={admin}
													onIonChange={(e) => {
														if (!admin && !e.detail.value) return
														if (isNewDeptAdmin) {
															localAdmins.depts[dept].push(e.detail.value ?? '')
															setLocalAdmins({ ...localAdmins })
															return
														}
														if (!e.detail.value) {
															localAdmins.depts[dept] = localAdmins.depts[dept].removeIndex(j)
															setLocalAdmins({ ...localAdmins })
															return
														}
														localAdmins.depts[dept][j] = e.detail.value ?? ''
														setLocalAdmins({ ...localAdmins })
													}}
												/>
												{!isNewDeptAdmin && (
													<IonButtons slot='end'>
														<IonButton
															onClick={() => {
																localAdmins.depts[dept] = localAdmins.depts[dept].removeIndex(j)
																setLocalAdmins({ ...localAdmins })
															}}
														>
															<IonIcon slot='icon-only' icon={removeOutline} />
														</IonButton>
													</IonButtons>
												)}
											</IonItem>
										)
									})}
								</IonList>
							</AccordionIonItem>
						)
					})}
				</IonList>
			</IonContent>
		</IonPage>
	)
}

export default ManageAdmins
