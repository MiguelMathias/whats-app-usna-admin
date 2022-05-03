import { IonDatetime, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonItemDivider, IonLabel, IonList, IonSelect, IonSelectOption } from '@ionic/react'
import { addDays } from 'date-fns'
import { RestaurantModel, RestaurantOrderModel } from '../../data/restaurants/Restaurant'
import { formatDateDefault } from '../../util/misc'

type RestaurantOrdersListHalfProps = {
	selectedOrderIndex: number
	setSelectedOrderIndex: (selectedOrderIndex: number) => void
	filteredOrders: RestaurantOrderModel[]
	selectedStatuses: string[]
	setSelectedStatuses: (selectedStatuses: string[]) => void
	fromDate: string
	setFromDate: (fromDate: string) => void
	toDate: string
	setToDate: (toDate: string) => void
	selectedLocationUids: string[]
	setSelectedLocationUids: (selectedLocationUids: string[]) => void
	restaurant: RestaurantModel
	limit: number
	incLimit: () => void
}

const RestaurantOrdersListHalf: React.FC<RestaurantOrdersListHalfProps> = ({
	filteredOrders,
	selectedOrderIndex,
	setSelectedOrderIndex,
	selectedStatuses,
	setSelectedStatuses,
	fromDate,
	setFromDate,
	toDate,
	setToDate,
	selectedLocationUids,
	setSelectedLocationUids,
	restaurant,
	limit,
	incLimit,
}) => {
	return (
		<div className='ordersList'>
			<IonList style={{ height: '100%' }}>
				{restaurant.locations.length > 0 && (
					<IonItem>
						<IonLabel>Locations</IonLabel>
						<IonSelect
							slot='end'
							value={selectedLocationUids}
							multiple
							placeholder='Select Orders'
							onIonChange={(e) => {
								setSelectedLocationUids(e.detail.value)
							}}
						>
							{restaurant.locations.map((location) => (
								<IonSelectOption value={location.uid}>{location.name}</IonSelectOption>
							))}
						</IonSelect>
					</IonItem>
				)}
				<IonItem>
					<IonLabel>Order Status</IonLabel>
					<IonSelect
						slot='end'
						value={selectedStatuses}
						multiple
						placeholder='Select Orders'
						onIonChange={(e) => {
							setSelectedStatuses(e.detail.value)
							setSelectedOrderIndex(-1)
						}}
					>
						<IonSelectOption value='submitted' disabled>
							Submitted
						</IonSelectOption>
						<IonSelectOption value='accepted'>Accepted</IonSelectOption>
						<IonSelectOption value='rejected'>Rejected</IonSelectOption>
						<IonSelectOption value='fulfilled'>Fulfilled</IonSelectOption>
					</IonSelect>
				</IonItem>
				<IonItem>
					<IonLabel>From Date</IonLabel>
					<IonDatetime value={fromDate} onIonChange={(e) => setFromDate(e.detail.value ?? '')} max={addDays(new Date(toDate), -1).toISOString()} />
				</IonItem>
				<IonItem>
					<IonLabel>To Date</IonLabel>
					<IonDatetime value={toDate} onIonChange={(e) => setToDate(e.detail.value ?? '')} max={new Date().toISOString()} />
				</IonItem>
				<IonItemDivider>Orders</IonItemDivider>
				{filteredOrders.map((order, i) => (
					<IonItem
						key={i}
						detail
						button
						onClick={() => {
							selectedOrderIndex !== i ? setSelectedOrderIndex(i) : setSelectedOrderIndex(-1)
						}}
						className={selectedOrderIndex === i ? 'selected in' : 'in'}
					>
						<IonLabel>
							{order.displayName} - {formatDateDefault(order.submitted?.toDate())}
						</IonLabel>
					</IonItem>
				))}
				<IonInfiniteScroll onIonInfinite={incLimit} threshold='100px' disabled={filteredOrders.length < limit}>
					<IonInfiniteScrollContent loadingSpinner='dots' />
				</IonInfiniteScroll>
			</IonList>
		</div>
	)
}

export default RestaurantOrdersListHalf
