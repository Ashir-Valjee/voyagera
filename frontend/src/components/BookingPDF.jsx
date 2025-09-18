import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const formatDateTime = (dateStr) => {
    const options = { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateStr).toLocaleString(undefined, options);
};

const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Helvetica' },
    sectionTitle: { fontSize: 22, marginBottom: 20, textAlign: 'center', fontWeight: 'bold'},
    flightSection: { 
        marginBottom: 25, 
        padding: 15, 
        border: '1px solid #ddd', 
        borderRadius: 1, 
        backgroundColor: '#fdfdfdff' 
    },
    flightHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
    flightText: { fontSize: 10, marginBottom: 3 },
    activityContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    activityImage: { width: 100, height: 80, objectFit: 'cover', marginRight: 12, borderRadius: 2 },
    activityText: { flex: 1, fontSize: 10, lineHeight: 1.3 },
    activityName: { fontWeight: 'bold', marginBottom: 2, color: '#252525ff'},
    activityDate: { marginBottom: 5, color: '#000000ff' },
    activityPrice: { color: '#333' },
    footer: { marginTop: 30, fontSize: 8, textAlign: 'justify', color: '#555' },
    pageNumber: { position: 'absolute', fontSize: 8, bottom: 20, right: 30, color: '#555' },
    divider: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },
    watermark: {
        position: 'absolute',
        fontSize: 60,
        color: 'rgba(200, 200, 200, 0.2)',
        top: '40%',
        left: '20%',
        transform: 'rotate(-45deg)',
    },
    content: { position: 'relative' },
});

const BookingPDF = ({ flights }) => (
    <Document>
        <Page style={styles.page}>
            <Text style={styles.watermark}>VOYAGERA</Text>
            <Text style={styles.sectionTitle}> Your Itinerary </Text>

            {flights.map((flight, idx) => (
                <View key={idx} style={styles.flightSection}>
                    <Text style={styles.flightHeader}>
                        Flight {idx + 1}: {flight.departureCity} to {flight.destinationCity}
                    </Text>
                    <Text style={styles.flightText}>Departure: {formatDateTime(flight.departureDateTime)}</Text>
                    <Text style={styles.flightText}>Arrival: {formatDateTime(flight.arrivalDateTime)}</Text>
                    <Text style={styles.flightText}>Passengers: {flight.numberOfPassengers}</Text>
                    <Text style={styles.flightText}>Total Price: £{flight.totalPrice}</Text>

                    <Text style={[styles.flightHeader, { marginTop: 10 }]}>
                        Booked Activities ({flight.activities.length})
                    </Text>

                    {flight.activities && flight.activities.length > 0 ? (
                        flight.activities.map((activity, i) => (
                            <View key={i} style={styles.activityContainer}>
                                {activity.imageUrl && (
                                    <Image src={activity.imageUrl} style={styles.activityImage} />
                                )}
                                <View style={styles.activityText}>
                                    <Text style={styles.activityName}>{activity.activityName}</Text>
                                    <Text style={styles.activityDate}>{formatDateTime(activity.activityDateTime)}</Text>
                                    <Text style={styles.activityPrice}>£{activity.totalPrice}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.flightText}>No activities booked for this flight.</Text>
                    )}
                </View>
            ))}

            <Text style={styles.footer}>
                Voyagera acts as an agent in respect of all bookings made on our website or by telephone. For all bookings, 
                your contract will be with the applicable Service Provider of your chosen Travel Service (who may be the principal 
                or the agent of the principal) and Voyagera acts only as an agent on their behalf, except where we state to the 
                contrary in the Terms and Conditions. When you book certain flights or a package holiday with Voyagera, you are 
                fully protected under the ATOL scheme. You will receive an ATOL Certificate confirming what is ATOL protected, 
                where you can get information on what this means for you and who to contact if things go wrong. Please see our 
                terms and conditions for more information, or for more information about financial protection and the ATOL scheme, 
                please check ATOL Protection.
            </Text>
            <Text
                style={styles.pageNumber}
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                fixed
            />
        </Page>
    </Document>
);

export default BookingPDF;





