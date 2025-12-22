import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function ContainerViewer({ container, placements, items }) {
  const mountRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!container) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera
    const maxDim = Math.max(container.length, container.width, container.height);
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, maxDim * 10);
    camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5);
    camera.lookAt(container.length / 2, container.height / 2, container.width / 2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(container.length / 2, container.height / 2, container.width / 2);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update();

    // Container wireframe
    const containerGeo = new THREE.BoxGeometry(
      container.length,
      container.height,
      container.width
    );
    const edges = new THREE.EdgesGeometry(containerGeo);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333333 });
    const containerWireframe = new THREE.LineSegments(edges, lineMaterial);
    containerWireframe.position.set(
      container.length / 2,
      container.height / 2,
      container.width / 2
    );
    scene.add(containerWireframe);

    // Colors
    const colors = [
      0x3b82f6, 0x22c55e, 0xf59e0b, 0xef4444,
      0x8b5cf6, 0x06b6d4, 0xec4899, 0x84cc16,
    ];

    const geometries = [];
    const materials = [];
    const itemMeshes = [];

    // Render placed items
    if (placements) {
      placements.forEach((placement, index) => {
        if (!placement.placed) return;

        const itemGeo = new THREE.BoxGeometry(
          placement.placedLength,
          placement.placedHeight,
          placement.placedWidth
        );
        geometries.push(itemGeo);

        const itemMaterial = new THREE.MeshBasicMaterial({
          color: colors[index % colors.length],
          transparent: true,
          opacity: 0.7,
        });
        materials.push(itemMaterial);

        const itemMesh = new THREE.Mesh(itemGeo, itemMaterial);
        itemMesh.position.set(
          placement.x + placement.placedLength / 2,
          placement.z + placement.placedHeight / 2,
          placement.y + placement.placedWidth / 2
        );
        
        itemMesh.userData = { placement, index };
        
        scene.add(itemMesh);
        itemMeshes.push(itemMesh);

        // Item edges
        const itemEdges = new THREE.EdgesGeometry(itemGeo);
        const itemLineMat = new THREE.LineBasicMaterial({ color: 0x000000 });
        const itemWireframe = new THREE.LineSegments(itemEdges, itemLineMat);
        itemWireframe.position.copy(itemMesh.position);
        scene.add(itemWireframe);
        
        geometries.push(itemEdges);
        materials.push(itemLineMat);
      });
    }

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Hover highlighting
    let hoveredMesh = null;
    const originalColors = new Map();

    const handleMouseMove = (event) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(itemMeshes);

      // Reset previous hover
      if (hoveredMesh && (!intersects.length || intersects[0].object !== hoveredMesh)) {
        hoveredMesh.material.color.setHex(originalColors.get(hoveredMesh));
        hoveredMesh.material.opacity = 0.7;
        hoveredMesh = null;
        mount.style.cursor = 'grab';
      }

      // Highlight new hover
      if (intersects.length > 0) {
        const hovered = intersects[0].object;
        if (hovered !== hoveredMesh) {
          if (!originalColors.has(hovered)) {
            originalColors.set(hovered, hovered.material.color.getHex());
          }
          hovered.material.color.setHex(0xffffff);
          hovered.material.opacity = 0.9;
          hoveredMesh = hovered;
          mount.style.cursor = 'pointer';
        }
      }
    };

    const handleClick = (event) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(itemMeshes);

      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        setSelectedItem(clicked.userData.placement);
      } else {
        setSelectedItem(null);
      }
    };

    mount.addEventListener('mousemove', handleMouseMove);
    mount.addEventListener('click', handleClick);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      mount.removeEventListener('mousemove', handleMouseMove);
      mount.removeEventListener('click', handleClick);
      controls.dispose();
      mount.removeChild(renderer.domElement);
      containerGeo.dispose();
      edges.dispose();
      lineMaterial.dispose();
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      renderer.dispose();
    };
  }, [container, placements]);

  if (!container) {
    return <div className="text-gray-500">No container selected</div>;
  }

  return (
    <div className="relative">
      <div 
        ref={mountRef} 
        style={{ width: '100%', height: '500px' }}
        className="border rounded-lg overflow-hidden cursor-grab"
      />
      
      {selectedItem && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
          <h4 className="font-semibold mb-2">
            {items?.find(i => i.id === selectedItem.itemId)?.name || 'Item'}
          </h4>
          <div className="text-sm space-y-1 text-gray-600">
            <p>Position: ({selectedItem.x}, {selectedItem.y}, {selectedItem.z})</p>
            <p>Size: {selectedItem.placedLength} × {selectedItem.placedWidth} × {selectedItem.placedHeight} mm</p>
            {selectedItem.rotated && <p className="text-amber-600">↻ Rotated to fit</p>}
          </div>
          <button 
            onClick={() => setSelectedItem(null)}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Click elsewhere to close
          </button>
        </div>
      )}
    </div>
  );
}

export default ContainerViewer;