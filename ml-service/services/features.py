import numpy as np
from typing import List
from schemas import Item, Container


def extract_utilization_features(items: List[Item], container: Container) -> List[float]:
    """10 features for utilization prediction"""
    container_vol = container.length * container.width * container.height
    
    all_volumes = []
    total_items = 0
    
    for item in items:
        vol = item.length * item.width * item.height
        qty = item.quantity or 1
        total_items += qty
        all_volumes.extend([vol] * qty)
    
    num_types = len(items)
    items_per_type = total_items / num_types if num_types > 0 else 0
    total_vol = sum(all_volumes)
    fill_ratio = total_vol / container_vol if container_vol > 0 else 0
    
    avg_vol = np.mean(all_volumes) if all_volumes else 0
    max_vol = max(all_volumes) if all_volumes else 0
    min_vol = min(all_volumes) if all_volumes else 0
    std_vol = np.std(all_volumes) if all_volumes else 0
    
    avg_ratio = avg_vol / container_vol if container_vol > 0 else 0
    max_ratio = max_vol / container_vol if container_vol > 0 else 0
    
    return [num_types, total_items, items_per_type, fill_ratio,
            avg_vol, max_vol, min_vol, std_vol, avg_ratio, max_ratio]


def extract_algorithm_features(items: List[Item], container: Container) -> dict:
    """5 features for algorithm selection"""
    container_vol = container.length * container.width * container.height
    
    num_types = len(items)
    total_items = sum(item.quantity or 1 for item in items)
    
    volumes = []
    aspect_ratios = []
    total_vol = 0
    
    for item in items:
        vol = item.length * item.width * item.height
        qty = item.quantity or 1
        volumes.extend([vol] * qty)
        total_vol += vol * qty
        
        dims = sorted([item.length, item.width, item.height])
        aspect_ratios.append(dims[2] / dims[0] if dims[0] > 0 else 1.0)
    
    fill_ratio = total_vol / container_vol if container_vol > 0 else 0
    
    if len(volumes) > 1:
        size_var = np.std(volumes) / np.mean(volumes) if np.mean(volumes) > 0 else 0
    else:
        size_var = 0
    
    return {
        "num_item_types": num_types,
        "total_items": total_items,
        "fill_ratio": fill_ratio,
        "size_variance_normalized": size_var,
        "avg_aspect_ratio": np.mean(aspect_ratios) if aspect_ratios else 1.0
    }