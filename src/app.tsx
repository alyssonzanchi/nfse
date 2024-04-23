import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { useEffect, useState, ChangeEvent } from 'react';
import { Table } from './components/table/table';
import { TableHeader } from './components/table/table-header';
import { TableCell } from './components/table/table-cell';
import { TableRow } from './components/table/table-row';
import { IconButton } from './components/icon-button';
import { Toaster, toast } from 'sonner';

type Imovel = {
  id: number;
  cod_loc: number;
  endereco: string;
  tomadorId: number;
};

type Tomador = {
  id: number;
  nome_razao_social: string;
};

type inputValue = {
  [key: number]: string;
};

export function App() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [tomador, setTomador] = useState<Tomador[]>([]);
  const [inputValue, setInputValue] = useState<inputValue>({});

  const [search, setSearch] = useState(() => {
    const url = new URL(window.location.toString())

    if(url.searchParams.has('search')) {
      return url.searchParams.get('search') ?? ''
    }

    return ''
  })

  const [page, setPage] = useState(() => {
    const url = new URL(window.location.toString())

    if(url.searchParams.has('page')) {
      return Number(url.searchParams.get('page'))
    }

    return 1
  })

  const [total, setTotal] = useState(0)
  const totalPages = Math.ceil(total / 10)

  useEffect(() => {
    const url = new URL(`${import.meta.env.VITE_API_URL}/imovel`)

    url.searchParams.set('pageIndex', String(page - 1))

    if(search.length > 0) {
      url.searchParams.set('query', search)
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setImoveis(data.imoveis)
        setTotal(data.total)
      })
  }, [page, search]);

  function setCurrentSearch(search: string) {
    const url = new URL(window.location.toString())

    url.searchParams.set('search', search)

    window.history.pushState({}, '', url)

    setSearch(search)
  }

  function setCurrentPage(page: number) {
    const url = new URL(window.location.toString())

    url.searchParams.set('page', String(page))

    window.history.pushState({}, '', url)

    setPage(page)
  }

  useEffect(() => {
    const fetchTomador = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/tomador`);
        if (!response.ok) {
          throw new Error('Erro ao buscar o tomador');
        }
        const tomadorData = await response.json();
        setTomador(tomadorData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTomador();
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
    imovelId: number
  ) => {
    const { value } = event.target;
    setInputValue((prevState) => ({
      ...prevState,
      [imovelId]: value
    }));
  };

  const handleClick = async (imovelId: number) => {
    const value = inputValue[imovelId];

    if (!value) return;

    const response = await fetch(`${import.meta.env.VITE_API_URL}/xml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imovelId, value })
    });

    if (!response.ok) {
      toast.error('Erro', {
        description: response.statusText
      })
    } else {
      toast.success('Sucesso', {
        description: 'Nota Fiscal gerada com sucesso'
      })
    }
  };

  function onSearchInputChanged(event: ChangeEvent<HTMLInputElement>) {
    setCurrentSearch(event.target.value)
    setCurrentPage(1)
  }

  function goToFirstPage() {
    setCurrentPage(1)
  }

  function goToPreviousPage() {
    setCurrentPage(page - 1)
  }

  function goToNextPage() {
    setCurrentPage(page + 1)
  }

  function goToLastPage() {
    setCurrentPage(totalPages)
  }

  return (
    <div className='max-w-[1216px] mx-auto py-5 flex flex-col gap-5'>
      <Toaster richColors />
      <div className='flex gap-3 items-center py-4'>
        <h1 className='text-2xl font-bold'>Proprietários</h1>
        <div className='px-3 py-1.5 border border-white/10 rounded-lg w-72 flex items-center gap-3'>
          <Search className='size-4 text-red-500' />
          <input 
            onChange={onSearchInputChanged} 
            className='bg-transparent flex-1 outline-none border-0 p-0 text-sm focus:ring-0'
            placeholder='Buscar proprietário...' />
        </div>
      </div>
      <Table>
        <thead>
          <tr className='border-b border-white/10'>
            <TableHeader>Proprietário</TableHeader>
            <TableHeader>Imóvel</TableHeader>
            <TableHeader>Valor</TableHeader>
            <TableHeader style={{ width: 64 }}></TableHeader>
          </tr>
        </thead>
        <tbody>
          {imoveis.map((imovel) => (
            <TableRow key={imovel.id}>
              <TableCell>
                {tomador.map(
                  (tomador) => 
                    tomador.id === imovel.tomadorId && tomador.nome_razao_social
                )}
              </TableCell>
              <TableCell>{imovel.endereco}</TableCell>
              <TableCell>
                <input 
                  key={imovel.id} 
                  type="text"
                  value={inputValue[imovel.id] || ''} 
                  onChange={(e) => handleChange(e, imovel.id)}
                  className='w-32 bg-transparent outline-none border border-white/10 rounded-lg px-3 py-1.5 gap-3 text-sm focus:ring-0'/>
              </TableCell>
              <TableCell>
                <IconButton 
                  onClick={() => handleClick(imovel.id)}
                  style={{ width: 64 }}
                >
                  Enviar
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <TableCell colSpan={2}>
              Mostrando {imoveis.length} de {total} itens
            </TableCell>
            <TableCell className='text-right' colSpan={2}>
              <div className='inline-flex items-center gap-8'>
                <span>Página {page} de {totalPages}</span>

                <div className='flex gap-1.5'>
                  <IconButton onClick={goToFirstPage} disabled={page === 1}>
                    <ChevronsLeft className='size-4' />
                  </IconButton>

                  <IconButton onClick={goToPreviousPage} disabled={page === 1}>
                    <ChevronLeft className='size-4' />
                  </IconButton>

                  <IconButton onClick={goToNextPage} disabled={page === totalPages}>
                    <ChevronRight className='size-4' />
                  </IconButton>

                  <IconButton onClick={goToLastPage} disabled={page === totalPages}>
                    <ChevronsRight className='size-4' />
                  </IconButton>
                </div>
              </div>
            </TableCell>
          </tr>
        </tfoot>
      </Table>
    </div>
  )
}
