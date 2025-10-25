import pandas as pd
import numpy as np
from collections import defaultdict

df = pd.read_csv('../data/ncr_ride_bookings.csv')

route_map = defaultdict(list)

for _, row in df.iterrows():

    if row['Booking Status'] != 'Completed':
        continue 

    pickup = row['Pickup Location']
    drop = row['Drop Location']

    route_key = f"{min(pickup, drop)} <-> {max(pickup, drop)}"
    
    values_tuple = (
        row['Booking Value'],
        row['Ride Distance'],
        row['Driver Ratings'],
        row['Avg VTAT'],
        row['Avg CTAT']
    )
    
    route_map[route_key].append(values_tuple)

route_map = dict(route_map)

# Jetzt berechne Standardabweichungen für jede Route
result_map = {}

for route, values_list in route_map.items():
    # Konvertiere Liste von Tupeln zu numpy array für einfachere Berechnung
    values_array = np.array(values_list)
    
    # Berechne Standardabweichung für jede Spalte
    std_values = np.std(values_array, axis=0)

    mean_values = np.mean(values_array, axis=0)
    
    result_map[route] = {
        'Booking Value Std': std_values[0],
        'Booking Value Mean': mean_values[0],
        'Ride Distance Std': std_values[1],
        'Ride Distance Mean': mean_values[1],
        'Driver Ratings Std': std_values[2],
        'Driver Ratings Mean': mean_values[2],
        'Avg VTAT Std': std_values[3],
        'Avg VTAT Mean': mean_values[3],
        'Avg CTAT Std': std_values[4],
        'Avg CTAT Mean': mean_values[4],
        'Count': len(values_list)
    }

# Ausgabe der Standardabweichungen
print("\n\n=== Standardabweichungen pro Route ===")
top_routes = sorted(result_map.items(), key=lambda x: x[1]['Count'], reverse=True)[:5]

for i, (route, stats) in enumerate(top_routes, 1):
    print(f"\n{route} ({stats['Count']} Fahrten)")
    print(f"  Booking Value Std: {stats['Booking Value Std']:.2f}")
    print(f"  Booking Value Mean: {stats['Booking Value Mean']:.2f}")
    print(f"  Ride Distance Std: {stats['Ride Distance Std']:.2f}")
    print(f"  Ride Distance Mean: {stats['Ride Distance Mean']:.2f}")
    print(f"  Driver Ratings Std: {stats['Driver Ratings Std']:.2f}")
    print(f"  Driver Ratings Mean: {stats['Driver Ratings Mean']:.2f}")
    print(f"  Avg VTAT Std: {stats['Avg VTAT Std']:.2f}")
    print(f"  Avg VTAT Mean: {stats['Avg VTAT Mean']:.2f}")
    print(f"  Avg CTAT Std: {stats['Avg CTAT Std']:.2f}")
    print(f"  Avg CTAT Mean: {stats['Avg CTAT Mean']:.2f}")

# Rückgabe der Maps
print("\n=== Zusammenfassung ===")
print(f"Anzahl eindeutiger Routen: {len(route_map)}")
print(f"Gesamtanzahl Fahrten: {sum(len(v) for v in route_map.values())}")
