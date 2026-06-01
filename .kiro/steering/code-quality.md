# Calidad de Código y Refactoring

## Principios generales

Siempre que escribas o modifiques código, aplica estos principios de forma automática. No esperes a que el usuario lo pida.

## Funciones y componentes

- Una función hace una sola cosa (Single Responsibility).
- Si una función supera ~30 líneas, evalúa si puede dividirse.
- Si un componente supera ~150 líneas, extrae sub-componentes o custom hooks.
- Evita lógica compleja directamente en el JSX; muévela a variables o funciones auxiliares.
- Extrae lógica de estado y efectos a custom hooks cuando el componente empiece a crecer.

```tsx
// ❌ Evitar
const MyComponent = () => {
  const [data, setData] = useState([]);
  useEffect(() => { /* fetch complejo */ }, []);
  const filtered = data.filter(x => x.active).sort(...).map(...);
  return <div>{filtered.map(item => <ComplexItem key={item.id} {...item} />)}</div>;
};

// ✅ Preferir
const MyComponent = () => {
  const { filteredData } = useMyData(); // lógica en hook
  return <div>{filteredData.map(item => <MyItem key={item.id} item={item} />)}</div>;
};
```

## Naming

- Los nombres deben revelar intención. Si necesitas un comentario para explicar una variable, el nombre es malo.
- Evita nombres genéricos: `data`, `info`, `temp`, `value`, `item` (a menos que el contexto sea muy claro).
- Los booleanos siempre con prefijo: `isLoading`, `hasError`, `canSubmit`, `shouldRefetch`.

## Evitar código duplicado (DRY)

- Si copias y pegas más de 2 veces, extrae una función, hook o componente.
- Lógica de transformación de datos va en `src/lib/` o en la capa de aplicación, no inline en componentes.
- Constantes repetidas van en un archivo de constantes, no hardcodeadas en múltiples lugares.

## Complejidad

- Evita anidamiento profundo (más de 3 niveles de if/else o ternarios encadenados).
- Usa early returns para reducir anidamiento:

```typescript
// ❌ Evitar
const process = (user) => {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        return doSomething(user);
      }
    }
  }
};

// ✅ Preferir
const process = (user) => {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.hasPermission) return;
  return doSomething(user);
};
```

- Evita ternarios anidados. Si necesitas más de un nivel, usa if/else o un objeto de mapeo.

## Componentes React

- Extrae listas a componentes separados cuando el render de cada item tiene lógica propia.
- Evita props drilling de más de 2 niveles; usa contexto o estado global (Zustand).
- Memoriza con `useMemo` / `useCallback` solo cuando haya un problema de rendimiento real, no de forma preventiva.
- Mantén los efectos (`useEffect`) simples y con una sola responsabilidad por efecto.

## Imports y exports

- Usa barrel exports (`index.ts`) para exponer la API pública de cada módulo.
- Ordena los imports: librerías externas → alias internos (`@/`) → relativos (`./`).
- Elimina imports no usados siempre.

## Tipos TypeScript

- Evita tipos redundantes que TypeScript puede inferir.
- Evita casteos con `as` salvo que sea estrictamente necesario.
- Prefiere tipos estrechos (específicos) sobre tipos amplios (`string` vs `'active' | 'inactive'`).
- Extrae tipos complejos o reutilizados a archivos de tipos dedicados.

## Antes de dar por terminado cualquier código

Revisa mentalmente:

1. ¿Hay lógica duplicada que pueda extraerse?
2. ¿Los nombres son descriptivos y en inglés?
3. ¿Las funciones/componentes tienen una sola responsabilidad?
4. ¿Hay imports sin usar?
5. ¿El código es legible sin necesidad de comentarios explicativos?
6. ¿Los tipos están bien definidos sin usar `any`?
