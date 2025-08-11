// Client now calls Netlify Function endpoint instead of Telegram API directly.
    // Put your serverless function at /.netlify/functions/sendOrder

    const MENU = [
      {id:1, title:'Laziz Osh', desc:'An\'anaviy palov', price:32000, img:'https://images.unsplash.com/photo-1604908177522-46f6f1d7a6b4?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:2, title:'Somsa (3 dona)', desc:'Issiq, yog\'li', price:12000, img:'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:3, title:'Shashlik', desc:'Mol go\'shti, maxsus marinad', price:45000, img:'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:4, title:'Salat "Ziyo"', desc:'Yangi sabzavotlar', price:18000, img:'https://images.unsplash.com/photo-1542444459-db3d7f8b0a74?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:5, title:'Achchiq sho\'rva', desc:'Issiq sho\'rva', price:15000, img:'https://images.unsplash.com/photo-1604908177522-46f6f1d7a6b4?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'},
      {id:6, title:'Qozon kabob', desc:'Mol go\'shti, issiq taom', price:50000, img:'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'}
    ];

    let cart = JSON.parse(localStorage.getItem('gb_cart')||'[]');
    const menuGrid = document.getElementById('menuGrid');
    const cartBtn = document.getElementById('openCartBtn');
    const cartItemsEl = document.getElementById('cartItems');
    const orderForm = document.getElementById('orderForm');

    function renderMenu(){
      menuGrid.innerHTML = '';
      MENU.forEach(item =>{
        const card = document.createElement('div'); card.className='menu-card';
        card.innerHTML = `
          <div class="menu-img" style="background-image:url('${item.img}')"></div>
          <div class="dish-title">${item.title}</div>
          <div class="dish-desc">${item.desc}</div>
          <div class="dish-foot">
            <div class="price">${item.price.toLocaleString()} so'm</div>
            <div>
              <button class="btn btn-sm btn-accent" data-id="${item.id}">Qo'shish</button>
            </div>
          </div>
        `;
        menuGrid.appendChild(card);
      });
    }

    function renderCart(){
      cartItemsEl.innerHTML='';
      if(cart.length===0){ cartItemsEl.innerHTML = '<div class="text-muted">Savatcha bo\'sh</div>'; updateCartBtn(); return }
      cart.forEach((c,idx)=>{
        const row = document.createElement('div'); row.className='d-flex align-items-center gap-2 mb-3';
        row.innerHTML = `
          <div style="width:64px;height:64px;border-radius:8px;background-image:url('${c.img}');background-size:cover;background-position:center"></div>
          <div class="flex-grow-1">
            <div style="font-weight:600">${c.title}</div>
            <div class="text-muted" style="font-size:13px">${c.qty} x ${c.price.toLocaleString()} so'm</div>
          </div>
          <div class="text-end">
            <div style="font-weight:700">${(c.qty*c.price).toLocaleString()} so'm</div>
            <div class="mt-1 d-flex gap-1">
              <button class="btn btn-sm btn-outline-light btn-decrease" data-idx="${idx}">-</button>
              <button class="btn btn-sm btn-outline-light btn-increase" data-idx="${idx}">+</button>
              <button class="btn btn-sm btn-outline-light btn-remove" data-idx="${idx}">x</button>
            </div>
          </div>
        `;
        cartItemsEl.appendChild(row);
      });

      const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
      const footer = document.createElement('div'); footer.className='mt-3';
      footer.innerHTML = `<div class="d-flex justify-content-between align-items-center"><div class="text-muted">Jami</div><div style="font-weight:800">${total.toLocaleString()} so'm</div></div>`;
      cartItemsEl.appendChild(footer);
      updateCartBtn();
    }

    function updateCartBtn(){
      const count = cart.reduce((s,i)=>s+i.qty,0);
      cartBtn.innerText = `Savatcha (${count})`;
      localStorage.setItem('gb_cart',JSON.stringify(cart));
    }

    document.addEventListener('click', e=>{
      const add = e.target.closest('button[data-id]');
      if(add){
        const id = Number(add.dataset.id);
        const item = MENU.find(m=>m.id===id);
        const exists = cart.find(c=>c.id===id);
        if(exists) exists.qty++;
        else cart.push({id:item.id,title:item.title,price:item.price,img:item.img,qty:1});
        renderCart();
      }

      if(e.target.classList.contains('btn-increase')){
        const i = Number(e.target.dataset.idx);
        cart[i].qty++;
        renderCart();
      }
      if(e.target.classList.contains('btn-decrease')){
        const i = Number(e.target.dataset.idx);
        cart[i].qty = Math.max(1, cart[i].qty-1);
        renderCart();
      }
      if(e.target.classList.contains('btn-remove')){
        const i = Number(e.target.dataset.idx);
        cart.splice(i,1);
        renderCart();
      }
    });

    const bsOff = new bootstrap.Offcanvas(document.getElementById('cartPanel'));
    document.getElementById('openCart').addEventListener('click', ()=> bsOff.show());
    document.getElementById('openCartBtn').addEventListener('click', ()=> bsOff.show());
    document.getElementById('heroOrder').addEventListener('click', ()=> bsOff.show());
    document.getElementById('clearCart').addEventListener('click', ()=>{ cart=[]; renderCart(); });

    // When submitting, send order to serverless function which holds bot token securely
    orderForm.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      if(cart.length===0){ alert('Savatcha bo\'sh'); return }
      const name = document.getElementById('customerName').value.trim();
      const phone = document.getElementById('customerPhone').value.trim();
      const addr = document.getElementById('customerAddress').value.trim();

      const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
      const payload = { name, phone, addr, items: cart, total };

      try{
        const res = await fetch('/.netlify/functions/sendOrder', {
          method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(res.ok && data.ok){
          alert('Buyurtmangiz qabul qilindi! Tez orada tasdiqlanadi.');
          const orders = JSON.parse(localStorage.getItem('gb_orders')||'[]');
          orders.push({id:Date.now(),name,phone,addr,cart,total,status:'sent'});
          localStorage.setItem('gb_orders', JSON.stringify(orders));
          cart = []; renderCart(); bsOff.hide();
        } else {
          console.error(data);
          alert('Xato: ' + (data.message || JSON.stringify(data)));
        }
      } catch(err){ console.error(err); alert('So' + "'" + 'rov yuborishda xato yuz berdi'); }
    });

    renderMenu(); renderCart();
    document.querySelectorAll('a[href^="#"]').forEach(a=>{ a.addEventListener('click', e=>{ e.preventDefault(); const t=document.querySelector(a.getAttribute('href')); if(t) t.scrollIntoView({behavior:'smooth'}); }); });